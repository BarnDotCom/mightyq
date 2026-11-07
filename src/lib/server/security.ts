import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "./config";

/** Cloudflare Turnstile check. Skipped (with a warning) only when no secret is configured. */
export async function verifyTurnstile(token: string | null | undefined, ip?: string | null): Promise<boolean> {
  if (!config.turnstileSecret) {
    console.warn("TURNSTILE_SECRET_KEY not set: spam check skipped");
    return true;
  }
  if (!token) return false;
  const body = new URLSearchParams({ secret: config.turnstileSecret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("Turnstile check failed", err);
    return false;
  }
}

function secret(): string {
  if (!config.siteSecret) throw new Error("SITE_SECRET is not set");
  return config.siteSecret;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * An upload session: issued after the spam check, lets one visitor upload files
 * under `submissions/<id>/` for two hours, then submit the form once.
 */
export function createUploadSession(): { id: string; token: string } {
  const id = `${new Date().toISOString().slice(0, 10)}-${randomToken(9)}`;
  const exp = Date.now() + 2 * 60 * 60 * 1000;
  const payload = `${id}.${exp}`;
  return { id, token: `${payload}.${sign(payload)}` };
}

export function readUploadSession(token: string | null | undefined): { id: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (!safeEqual(sig, sign(`${id}.${exp}`))) return null;
  if (Number(exp) < Date.now()) return null;
  return { id };
}

/** Signed, expiring link to a private file (used so Airtable can fetch image previews). */
export function signFilePath(pathname: string, ttlMs = 24 * 60 * 60 * 1000): string {
  const exp = Date.now() + ttlMs;
  return `exp=${exp}&sig=${sign(`file:${pathname}:${exp}`)}`;
}

export function checkFileSignature(pathname: string, exp: string | null, sig: string | null): boolean {
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(`file:${pathname}:${exp}`));
}

/** Basic auth for team-only routes: any user name, the shared TEAM_PASSWORD. */
export function checkTeamAuth(header: string | null): boolean {
  if (!config.teamPassword || !header?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString();
  const password = decoded.slice(decoded.indexOf(":") + 1);
  return safeEqual(password, config.teamPassword);
}
