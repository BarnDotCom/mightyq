import "server-only";

/** Server-side settings. Every secret lives in Vercel's environment variables, never in the repo. */
export const config = {
  airtableToken: process.env.AIRTABLE_TOKEN || "",
  airtableBase: process.env.AIRTABLE_BASE_ID || "appyFjGiI3k60oMp3",
  submissionsTable: process.env.AIRTABLE_SUBMISSIONS_TABLE || "tblQzYHzWd6B1vYJT",
  subscribersTable: process.env.AIRTABLE_SUBSCRIBERS_TABLE || "tblxE5aWDkEt8QMAx",
  resendKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "The Mighty Q <hello@mightyq.film>",
  emailReplyTo: process.env.EMAIL_REPLY_TO || "info@mightyq.film",
  teamEmail: process.env.TEAM_EMAIL || "info@mightyq.film",
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY || "",
  siteSecret: process.env.SITE_SECRET || "",
  teamPassword: process.env.TEAM_PASSWORD || "",
  siteUrl:
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
};

/** Wording of the consent box. Bump the version whenever the wording changes (CASL record). */
export const CONSENT_VERSION = "2026-11-07";
export const CONSENT_WORDING = "Yes, send me email about The Mighty Q. I can unsubscribe at any time.";

/** Upload limits. */
export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
export const ALLOWED_TYPES = [
  "image/*",
  "audio/*",
  "video/*",
  "application/pdf",
];
