"use client";

import Link from "next/link";
import { uploadPresigned } from "@vercel/blob/client";
import { useActionState, useRef, useState, startTransition, type FormEvent } from "react";
import { beginShareSession, submitShare, type FormState } from "@/app/actions";
import { Captcha, captchaEnabled } from "./Captcha";
import { SubmitButton } from "./ui";

const MAX_FILES = 10;
const MAX_BYTES = 2 * 1024 * 1024 * 1024;

const RELATIONSHIPS = ["A listener", "On staff at the station", "In a band", "In the business", "Something else"];
const TYPES = ["Off-air recording", "Photos", "Video", "Memorabilia", "A story or memory", "Something else"];
const ERAS = ["1977–1979", "1980–1984", "1985–1989", "1990s", "2000s or later", "Not sure"];

type Uploaded = { pathname: string; name: string; size: number; contentType: string };
type FileItem = { key: string; file: File; progress: number; status: "uploading" | "done" | "error"; error?: string; result?: Uploaded };

function sizeLabel(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").slice(-120) || "file";
}

const legend = "px-2.5 font-wood text-[26px] font-extrabold tracking-[0.04em] text-gold uppercase";
const fieldset = "m-0 flex min-w-0 flex-col gap-5 border border-rule bg-ground-raised p-5 sm:p-8";
const label = "font-narrow text-[15px] font-bold tracking-[0.06em] text-ink uppercase";
const optional = "font-normal tracking-normal normal-case text-ink-muted";

export function ShareForm() {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(submitShare, null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const captchaToken = useRef<string>("");
  const session = useRef<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function ensureSession(): Promise<string | null> {
    if (session.current) return session.current;
    if (captchaEnabled && !captchaToken.current) {
      setNotice("One moment — we’re checking you’re not a robot. Try again in a few seconds.");
      return null;
    }
    const res = await beginShareSession(captchaToken.current);
    if (!res.ok || !res.token) {
      setNotice(res.message || "Something went wrong. Please reload the page.");
      return null;
    }
    session.current = res.token;
    return res.token;
  }

  function update(key: string, patch: Partial<FileItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  async function addFiles(list: FileList | File[]) {
    setNotice(null);
    const incoming = Array.from(list);
    const room = MAX_FILES - items.length;
    if (incoming.length > room) setNotice(`Up to ${MAX_FILES} files, please. For more, paste a link below or write to info@mightyq.film.`);
    const accepted = incoming.slice(0, Math.max(0, room)).filter((f) => {
      if (f.size > MAX_BYTES) {
        setNotice(`${f.name} is over 2 GB. Paste a link to it below instead.`);
        return false;
      }
      return true;
    });
    if (!accepted.length) return;

    const token = await ensureSession();
    if (!token) return;
    const sessionId = token.split(".")[0];

    const newItems: FileItem[] = accepted.map((file) => ({
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      progress: 0,
      status: "uploading",
    }));
    setItems((prev) => [...prev, ...newItems]);

    await Promise.all(
      newItems.map(async (it) => {
        try {
          const blob = await uploadPresigned(`submissions/${sessionId}/${Math.random().toString(36).slice(2, 8)}-${safeName(it.file.name)}`, it.file, {
            access: "private",
            handleUploadUrl: "/api/upload",
            clientPayload: token,
            multipart: it.file.size > 50 * 1024 * 1024,
            contentType: it.file.type || undefined,
            onUploadProgress: ({ percentage }) => update(it.key, { progress: Math.round(percentage) }),
          });
          update(it.key, {
            status: "done",
            progress: 100,
            result: { pathname: blob.pathname, name: it.file.name, size: it.file.size, contentType: blob.contentType || it.file.type },
          });
        } catch (err) {
          const msg = (err as Error).message || "Upload failed";
          update(it.key, {
            status: "error",
            error: /content type/i.test(msg) ? "That type of file isn’t accepted (photos, audio, video or PDF only)." : msg,
          });
        }
      }),
    );
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // capture before any await: React clears currentTarget afterwards
    setNotice(null);
    if (items.some((it) => it.status === "uploading")) {
      setNotice("Hang on — your files are still uploading.");
      return;
    }
    const token = await ensureSession();
    if (!token) return;
    const fd = new FormData(form);
    fd.set("session", token);
    fd.set("files", JSON.stringify(items.filter((it) => it.status === "done" && it.result).map((it) => it.result)));
    startTransition(() => dispatch(fd));
  }

  if (state?.ok) {
    return (
      <div role="status" className="flex flex-col gap-4 border-2 border-gold bg-ground-raised p-8 sm:p-10">
        <p className="m-0 font-serif text-[13px] font-bold tracking-[0.2em] text-red-label uppercase">Received</p>
        <h2 className="m-0 font-display text-[clamp(36px,4vw,52px)] leading-none font-normal text-gold">Thank you. It’s in.</h2>
        <p className="m-0 font-serif text-xl leading-[1.45] text-ink">
          Your reference is <strong className="text-ink-bright">{state.ref}</strong>. We’ve emailed you a copy of what you sent. We read
          everything, and if it’s something we’d love to hear or see more of, we’ll be in touch.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            href="/share"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[52px] items-center border border-rule px-7 font-condensed text-lg font-bold tracking-[0.06em] text-gold-bright uppercase no-underline"
          >
            Send something else
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[52px] items-center bg-red px-7 font-condensed text-lg font-bold tracking-[0.06em] text-ink-bright uppercase no-underline"
          >
            Back to the film
          </Link>
        </div>
      </div>
    );
  }

  const uploading = items.some((it) => it.status === "uploading");

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-6" noValidate={false}>
      <label className="sr-only-field" aria-hidden="true">
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {/* 1 */}
      <fieldset className={fieldset}>
        <legend className={legend}>1 · About you</legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="s-name">
              Your name
            </label>
            <input id="s-name" name="name" className="mq-input" type="text" autoComplete="name" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="s-email">
              Email
            </label>
            <input id="s-email" name="email" className="mq-input" type="email" autoComplete="email" required />
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="s-phone">
              Phone <span className={optional}>(optional)</span>
            </label>
            <input id="s-phone" name="phone" className="mq-input" type="tel" autoComplete="tel" placeholder="If you’d rather we call" />
          </div>
          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="s-who">
              You were…
            </label>
            <select id="s-who" name="relationship" className="mq-input" defaultValue="A listener">
              {RELATIONSHIPS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* 2 */}
      <fieldset className={fieldset}>
        <legend className={legend}>2 · What you have</legend>
        <div className="flex flex-col gap-2.5">
          <span className={label}>Tick all that apply</span>
          <div className="flex flex-wrap gap-2.5">
            {TYPES.map((t) => (
              <label
                key={t}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 border border-rule px-4 text-base text-ink has-[:checked]:border-gold-bright has-[:checked]:bg-[#2a1a10] has-[:checked]:text-ink-bright"
              >
                <input type="checkbox" name="types" value={t} className="m-0 h-[18px] w-[18px] accent-gold" />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="s-when">
              Roughly when?
            </label>
            <select id="s-when" name="era" className="mq-input" defaultValue="Not sure">
              {ERAS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="s-title">
              In a few words
            </label>
            <input id="s-title" name="title" className="mq-input" type="text" maxLength={200} placeholder="e.g. Lennon night, side A" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className={label} htmlFor="s-story">
            Tell us about it
          </label>
          <textarea id="s-story" name="story" className="mq-input" maxLength={20000} />
          <span className="font-serif text-sm text-ink-muted italic">
            Who’s on it, where it was, what you remember. As long or short as you like.
          </span>
        </div>
      </fieldset>

      {/* 3 */}
      <fieldset className={fieldset}>
        <legend className={legend}>
          3 · Send it <span className="font-narrow text-base font-normal tracking-normal text-ink-muted normal-case">(optional)</span>
        </legend>
        <label
          htmlFor="s-files"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 border-2 border-dashed px-6 py-10 text-center ${dragging ? "border-gold-bright bg-[#1a140e]" : "border-rule"}`}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4801e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
          <span className="font-condensed text-xl font-bold tracking-[0.04em] text-ink-bright uppercase">Drop files here, or browse</span>
          <span className="text-base text-ink-muted">Photos, audio, video or PDF. Up to {MAX_FILES} files, 2 GB each.</span>
          <input
            ref={fileInput}
            id="s-files"
            type="file"
            multiple
            accept="image/*,audio/*,video/*,application/pdf"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {items.length ? (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {items.map((it) => (
              <li key={it.key} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1.5 border border-line-mid bg-ground px-4 py-3.5">
                <span className="truncate text-base text-ink-bright">
                  {it.file.name} <span className="text-ink-muted">· {sizeLabel(it.file.size)}</span>
                </span>
                <span className={`font-mono text-sm ${it.status === "error" ? "text-red-label" : it.status === "done" ? "text-gold-bright" : "text-ink"}`}>
                  {it.status === "done" ? "DONE ★" : it.status === "error" ? "FAILED" : `${it.progress}%`}
                </span>
                <button
                  type="button"
                  onClick={() => remove(it.key)}
                  aria-label={`Remove ${it.file.name}`}
                  className="h-9 w-9 cursor-pointer border border-line-mid bg-transparent text-ink-muted hover:text-ink-bright"
                >
                  ×
                </button>
                <div className="col-span-3 h-1.5 bg-line-dim">
                  <div className={`h-1.5 ${it.status === "error" ? "bg-red-label" : "bg-gold"}`} style={{ width: `${it.status === "error" ? 100 : it.progress}%` }} />
                </div>
                {it.error ? <span className="col-span-3 text-sm text-red-label">{it.error}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-2">
          <label className={label} htmlFor="s-link">
            Or paste a link <span className={optional}>(Dropbox, Google Drive, WeTransfer, YouTube)</span>
          </label>
          <input id="s-link" name="link" className="mq-input" type="url" placeholder="https://" />
        </div>
        <label className="flex items-start gap-3 text-[17px] leading-[1.45] text-ink">
          <input className="mq-check" type="checkbox" name="hasOriginal" />
          <span>I have the original tape or object, and I could lend it to be digitized.</span>
        </label>
      </fieldset>

      {/* 4 */}
      <fieldset className={`${fieldset} border-2 border-rule-red`}>
        <legend className={legend}>4 · The fine print</legend>
        <label className="flex items-start gap-3 text-[17px] leading-[1.45] text-ink">
          <input className="mq-check" type="checkbox" name="rights" required />
          <span>This is mine to share, or I have permission from whoever owns it.</span>
        </label>
        <label className="flex items-start gap-3 text-[17px] leading-[1.45] text-ink">
          <input className="mq-check" type="checkbox" name="contactOk" required />
          <span>You can contact me about what I’ve sent.</span>
        </label>
        <label className="flex items-start gap-3 text-[17px] leading-[1.45] text-ink">
          <input className="mq-check" type="checkbox" name="newsletter" />
          <span>
            Also send me email about <em>The Mighty Q</em>. I can unsubscribe at any time. <span className="text-ink-muted">(optional)</span>
          </span>
        </label>
        <p className="m-0 border border-line-mid bg-ground px-5 py-4 font-serif text-base leading-normal text-ink">
          Sending us something doesn’t give us the right to use it. If we’d like it in the film, we’ll ask your permission and a signed
          release first. <Link href="/terms">Submission terms</Link> · <Link href="/privacy">Privacy</Link>
        </p>
        <Captcha onSuccess={(t) => (captchaToken.current = t)} />
        {notice || (state && !state.ok) ? (
          <p role="alert" className="m-0 font-bold text-red-label">
            {notice || state?.message}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-1">
          <SubmitButton pending={pending || uploading}>{uploading ? "Uploading…" : "Send it in"}</SubmitButton>
          <span className="font-serif text-sm text-ink-muted italic">We’ll email you a copy of what you sent.</span>
        </div>
      </fieldset>
    </form>
  );
}
