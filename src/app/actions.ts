"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getSiteContent } from "@/lib/content";
import { createRecord, findByToken, findOne, rowUrl, updateRecord } from "@/lib/server/airtable";
import { config, CONSENT_VERSION, CONSENT_WORDING, MAX_FILES } from "@/lib/server/config";
import { sendConfirmEmail, sendSubmissionReceipt, sendTeamAlert } from "@/lib/server/email";
import { createUploadSession, randomToken, readUploadSession, signFilePath, verifyTurnstile } from "@/lib/server/security";

export type FormState = { ok: boolean; message: string; ref?: string } | null;

async function clientInfo() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  const referrer = h.get("referer") || "";
  return { ip, referrer };
}

const GENERIC_ERROR = "Something went wrong on our end. Please try again, or write to info@mightyq.film.";

/* ------------------------------------------------------------------ */
/* Sign-up (double opt-in)                                             */
/* ------------------------------------------------------------------ */

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: real people never fill this in.
  if (formData.get("website")) return { ok: true, message: "Thanks! Check your email to confirm." };

  const email = String(formData.get("email") || "").trim();
  const consent = formData.get("consent") === "on";
  const source = formData.get("source") === "share" ? "Share form" : "Home page";

  if (!z.email().safeParse(email).success) return { ok: false, message: "Please enter a valid email address." };
  if (!consent) return { ok: false, message: "Please tick the box so we have your permission to email you." };

  const { ip, referrer } = await clientInfo();
  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") || ""), ip))) {
    return { ok: false, message: "We couldn’t confirm you’re not a robot. Please try again." };
  }

  try {
    await addSubscriber(email, source, ip, referrer);
    return { ok: true, message: "Thanks! We’ve sent you an email — click the link in it to confirm." };
  } catch (err) {
    console.error("subscribe failed", err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

async function addSubscriber(email: string, source: string, ip: string, referrer: string) {
  const { settings } = await getSiteContent();
  const existing = await findOne(config.subscribersTable, "Email", email);
  if (existing?.fields.Status === "Confirmed") return; // Already on the list; say nothing more.

  const token = randomToken();
  const fields = {
    Email: email,
    Status: "Pending",
    "Consent wording": CONSENT_WORDING,
    "Consent version": CONSENT_VERSION,
    IP: ip,
    "Signup source": source,
    Referrer: referrer.slice(0, 500),
    Token: token,
  };
  if (existing) await updateRecord(config.subscribersTable, existing.id, fields);
  else await createRecord(config.subscribersTable, fields);
  await sendConfirmEmail(email, token, settings.senderLine);
}

export async function confirmSubscription(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") || "");
  try {
    const row = token ? await findByToken(config.subscribersTable, token) : null;
    if (!row) return { ok: false, message: "That link has expired or was already used. Sign up again on the home page." };
    if (row.fields.Status !== "Confirmed") {
      await updateRecord(config.subscribersTable, row.id, { Status: "Confirmed", "Confirmed at": new Date().toISOString() });
    }
    return { ok: true, message: "You’re on the list. We’ll be in touch." };
  } catch (err) {
    console.error("confirm failed", err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

export async function unsubscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") || "");
  try {
    const row = token ? await findByToken(config.subscribersTable, token) : null;
    if (!row) return { ok: false, message: "We couldn’t find that address. Write to info@mightyq.film and we’ll remove you." };
    await updateRecord(config.subscribersTable, row.id, { Status: "Unsubscribed", "Unsubscribed at": new Date().toISOString() });
    return { ok: true, message: "You’re unsubscribed. You won’t hear from us again." };
  } catch (err) {
    console.error("unsubscribe failed", err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

/* ------------------------------------------------------------------ */
/* Share your Q                                                        */
/* ------------------------------------------------------------------ */

/** Called once per visit, after the spam check: returns a token that allows uploads and one submission. */
export async function beginShareSession(turnstileToken: string): Promise<{ ok: boolean; token?: string; message?: string }> {
  const { ip } = await clientInfo();
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return { ok: false, message: "We couldn’t confirm you’re not a robot. Please reload the page and try again." };
  }
  try {
    return { ok: true, token: createUploadSession().token };
  } catch (err) {
    console.error("session failed", err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

const RELATIONSHIPS = ["A listener", "On staff at the station", "In a band", "In the business", "Something else"];
const TYPES = ["Off-air recording", "Photos", "Video", "Memorabilia", "A story or memory", "Something else"];
const ERAS = ["1977–1979", "1980–1984", "1985–1989", "1990s", "2000s or later", "Not sure"];

const fileSchema = z.object({
  pathname: z.string().min(1).max(500),
  name: z.string().min(1).max(300),
  size: z.number().int().nonnegative(),
  contentType: z.string().max(200),
});

const shareSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(200),
  email: z.email("Please enter a valid email address."),
  phone: z.string().trim().max(50).optional(),
  relationship: z.enum(RELATIONSHIPS).optional(),
  types: z.array(z.enum(TYPES)).max(TYPES.length),
  era: z.enum(ERAS).optional(),
  title: z.string().trim().max(200).optional(),
  story: z.string().trim().max(20000).optional(),
  link: z.union([z.literal(""), z.url("That link doesn’t look right. It should start with https://")]).optional(),
  hasOriginal: z.boolean(),
  rights: z.literal(true, "Please confirm this is yours to share."),
  contactOk: z.literal(true, "Please let us contact you about what you’ve sent."),
  newsletter: z.boolean(),
  files: z.array(fileSchema).max(MAX_FILES),
});

export async function submitShare(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) return { ok: true, message: "Thank you!", ref: "MQ-0000" };

  const session = readUploadSession(String(formData.get("session") || ""));
  if (!session) return { ok: false, message: "Your session expired. Please reload the page and try again (your files may need re-adding)." };

  let files: unknown = [];
  try {
    files = JSON.parse(String(formData.get("files") || "[]"));
  } catch {
    files = [];
  }

  const parsed = shareSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") || "").trim(),
    phone: formData.get("phone") || undefined,
    relationship: formData.get("relationship") || undefined,
    types: formData.getAll("types"),
    era: formData.get("era") || undefined,
    title: formData.get("title") || undefined,
    story: formData.get("story") || undefined,
    link: String(formData.get("link") || "").trim(),
    hasOriginal: formData.get("hasOriginal") === "on",
    rights: formData.get("rights") === "on",
    contactOk: formData.get("contactOk") === "on",
    newsletter: formData.get("newsletter") === "on",
    files,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Please check the form." };
  const d = parsed.data;

  if (!d.story && !d.title && d.files.length === 0 && !d.link) {
    return { ok: false, message: "Tell us a little about what you have, or add a file or a link." };
  }

  // Files must belong to this visitor's upload session.
  const prefix = `submissions/${session.id}/`;
  if (d.files.some((f) => !f.pathname.startsWith(prefix))) return { ok: false, message: GENERIC_ERROR };

  const { ip, referrer } = await clientInfo();
  const { settings } = await getSiteContent();
  const fileUrl = (p: string) => `${config.siteUrl}/team/files/${p.split("/").map(encodeURIComponent).join("/")}`;

  try {
    const record = await createRecord(config.submissionsTable, {
      Title: d.title || d.types.join(", ") || "Untitled",
      Status: "New",
      Name: d.name,
      Email: d.email,
      Phone: d.phone || undefined,
      Relationship: d.relationship,
      Types: d.types,
      Era: d.era,
      Story: d.story,
      Link: d.link || undefined,
      Files: d.files.map((f) => `${f.name} (${Math.round(f.size / 1024 / 1024 * 10) / 10} MB) — ${fileUrl(f.pathname)}`).join("\n") || undefined,
      Previews: d.files
        .filter((f) => f.contentType.startsWith("image/") && f.size < 25 * 1024 * 1024)
        .map((f) => ({ url: `${fileUrl(f.pathname)}?${signFilePath(f.pathname)}`, filename: f.name })),
      "Has original": d.hasOriginal,
      "Rights confirmed": d.rights,
      "Contact OK": d.contactOk,
      "Newsletter opt-in": d.newsletter,
      Source: [referrer, `session ${session.id}`].filter(Boolean).join(" · ").slice(0, 500),
    });
    const refNumber = Number(record.fields.Ref) || 0;
    const ref = `MQ-${String(refNumber).padStart(4, "0")}`;

    const summary = {
      ref,
      name: d.name,
      email: d.email,
      title: d.title || "",
      types: d.types,
      era: d.era || "",
      story: d.story || "",
      link: d.link || "",
      files: d.files.map((f) => ({ name: f.name, size: f.size })),
      hasOriginal: d.hasOriginal,
      relationship: d.relationship || "",
    };

    // Emails and the newsletter sign-up shouldn't lose the submission if they fail.
    const results = await Promise.allSettled([
      sendTeamAlert(summary, rowUrl(config.submissionsTable, record.id)),
      sendSubmissionReceipt(summary, settings.senderLine),
      d.newsletter ? addSubscriber(d.email, "Share form", ip, referrer) : Promise.resolve(),
    ]);
    results.forEach((r) => r.status === "rejected" && console.error("post-submit step failed", r.reason));

    return { ok: true, message: "Thank you — it’s in.", ref };
  } catch (err) {
    console.error("submit failed", err);
    return { ok: false, message: GENERIC_ERROR };
  }
}
