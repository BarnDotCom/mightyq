import "server-only";
import { Resend } from "resend";
import { config } from "./config";

/*
 * Plain, on-brand HTML emails. Every email carries who sent it, a mailing address
 * and (for list emails) an unsubscribe link, as CASL requires.
 */

const resend = config.resendKey ? new Resend(config.resendKey) : null;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(body: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#080705;padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#14100c;border:1px solid #a07a40;">
<tr><td style="background:#1f1b17;padding:16px 28px;border-bottom:1px solid #a07a40;">
<img src="${config.siteUrl}/wordmark.jpg" alt="The Mighty Q" width="72" style="display:block;height:auto;">
</td></tr>
<tr><td style="padding:28px;font-family:Georgia,serif;font-size:17px;line-height:1.55;color:#e6d6b6;">${body}</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #3a2f22;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#a39a8a;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#b02a1c;color:#f4eee0;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:16px;letter-spacing:0.06em;text-transform:uppercase;padding:14px 26px;">${label}</a></p>`;
}

async function send(to: string, subject: string, html: string, text: string, replyTo: string = config.emailReplyTo) {
  if (!resend) {
    console.warn(`RESEND_API_KEY not set: would have sent "${subject}" to ${to}`);
    return;
  }
  const { error } = await resend.emails.send({
    from: config.emailFrom,
    replyTo,
    to,
    subject,
    html,
    text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendConfirmEmail(to: string, token: string, senderLine: string) {
  const confirm = `${config.siteUrl}/confirm?token=${encodeURIComponent(token)}`;
  const body = `<p style="margin:0 0 16px;font-family:Georgia,serif;font-size:24px;color:#c4801e;"><strong>One click and you’re on the list.</strong></p>
<p style="margin:0;">Thanks for signing up for news about <em>The Mighty Q</em>, our documentary about Q107. Please confirm it’s you:</p>
${button(confirm, "Yes, keep me posted")}
<p style="margin:0;font-size:14px;color:#a39a8a;">If you didn’t ask for this, ignore this email and we won’t write again.</p>`;
  const footer = `Sent by ${esc(senderLine)}. Questions: <a href="mailto:${config.emailReplyTo}" style="color:#e8a840;">${config.emailReplyTo}</a>`;
  await send(
    to,
    "Confirm: news about The Mighty Q",
    layout(body, footer),
    `Thanks for signing up for news about The Mighty Q. Confirm here: ${confirm}\n\nIf you didn't ask for this, ignore this email.\n\nSent by ${senderLine}.`,
  );
}

export type SubmissionSummary = {
  ref: string;
  name: string;
  email: string;
  title: string;
  types: string[];
  era: string;
  story: string;
  link: string;
  files: { name: string; size: number }[];
  hasOriginal: boolean;
  relationship: string;
};

function sizeLabel(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function sendSubmissionReceipt(s: SubmissionSummary, senderLine: string) {
  const files = s.files.length
    ? `<ul style="margin:0 0 16px;padding-left:20px;">${s.files.map((f) => `<li>${esc(f.name)} (${sizeLabel(f.size)})</li>`).join("")}</ul>`
    : "";
  const body = `<p style="margin:0 0 16px;font-family:Georgia,serif;font-size:24px;color:#c4801e;"><strong>Got it. Thank you.</strong></p>
<p style="margin:0 0 16px;">Hi ${esc(s.name.split(" ")[0] || "there")}, your submission to <em>The Mighty Q</em> arrived safely. Your reference is <strong>${s.ref}</strong>.</p>
<p style="margin:0 0 8px;color:#f4eee0;"><strong>${esc(s.title || "What you sent")}</strong></p>
${s.story ? `<p style="margin:0 0 16px;white-space:pre-line;">${esc(s.story)}</p>` : ""}
${files}
<p style="margin:0 0 16px;">We read everything. If it’s something we’d love to hear or see more of, we’ll be in touch. Sending us something doesn’t give us the right to use it: if we’d like it in the film, we’ll ask your permission and a signed release first.</p>`;
  const footer = `Sent by ${esc(senderLine)}. Reply to this email to add anything.`;
  await send(
    s.email,
    `We got it (${s.ref}) — The Mighty Q`,
    layout(body, footer),
    `Hi ${s.name}, your submission to The Mighty Q arrived safely. Reference: ${s.ref}.\n\n${s.title}\n${s.story}\n\nWe read everything. Sending us something doesn't give us the right to use it: if we'd like it in the film, we'll ask your permission and a signed release first.\n\nSent by ${senderLine}.`,
  );
}

export async function sendTeamAlert(s: SubmissionSummary, airtableUrl: string) {
  const lines = [
    `<strong>${esc(s.title || "(no title)")}</strong> — ${esc(s.name)} &lt;${esc(s.email)}&gt;`,
    `${esc(s.relationship || "")} · ${esc(s.types.join(", ") || "—")} · ${esc(s.era || "—")}`,
    s.hasOriginal ? "<strong>Has the original and could lend it.</strong>" : "",
    s.files.length ? `${s.files.length} file(s): ${s.files.map((f) => `${esc(f.name)} (${sizeLabel(f.size)})`).join(", ")}` : "",
    s.link ? `Link: <a href="${esc(s.link)}" style="color:#e8a840;">${esc(s.link)}</a>` : "",
    s.story ? `<span style="white-space:pre-line;">${esc(s.story.slice(0, 1200))}</span>` : "",
  ].filter(Boolean);
  const body = `<p style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#c4801e;"><strong>New submission ${s.ref}</strong></p>
${lines.map((l) => `<p style="margin:0 0 12px;">${l}</p>`).join("")}
${button(airtableUrl, "Open in Airtable")}`;
  await send(
    config.teamEmail,
    `[Mighty Q] ${s.ref}: ${s.title || s.types.join(", ") || "new submission"} — ${s.name}`,
    layout(body, "Team alert from mightyq.film. Don't forward: it contains the sender's contact details."),
    `New submission ${s.ref}\n${s.title}\n${s.name} <${s.email}>\n${s.types.join(", ")} · ${s.era}\n${s.link}\n\n${s.story}\n\n${airtableUrl}`,
    s.email,
  );
}
