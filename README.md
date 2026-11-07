# mightyq.film

The website for **The Mighty Q**, a feature documentary about Q107. Next.js 16 on Vercel, content in Sanity (Studio at `/studio`), submissions and sign-ups in Airtable, uploads in a private Vercel Blob store, email through Resend, spam checks by Cloudflare Turnstile.

The technical plan lives in the team's shared folder: `10 Marketing & Audience/2026-11-07 mightyq.film — technical plan.md`.

## How it fits together

| What | Where |
|---|---|
| Page copy, most-wanted list, team, legal pages | Sanity (`/studio`). Until Sanity is connected, or for any field left empty, the defaults in `src/lib/content.ts` and `src/lib/legal.tsx` are used. |
| Email sign-ups (CASL consent record) | Airtable › *Subscribers*. Double opt-in: `Pending` → `Confirmed` via `/confirm`. `/unsubscribe` for leaving. |
| Share your Q submissions | Airtable › *Submissions*, plus an alert to info@mightyq.film and a receipt to the sender. |
| Uploaded files | Private Vercel Blob store, under `submissions/<session>/`. Team download links: `/team/files/…` (browser asks for the team password). |
| Analytics | Vercel Web Analytics (no cookies). `/mike` redirects to the home page with Toronto Mike'd UTM tags. |

Nothing personal goes into Sanity: the free plan's datasets are public.

## Environment variables (Vercel › Settings › Environment Variables)

| Name | What |
|---|---|
| `AIRTABLE_TOKEN` | Airtable personal access token: scopes `data.records:read` + `data.records:write`, access to the *Mighty Q — Website* base only |
| `AIRTABLE_BASE_ID` | Optional; defaults to `appyFjGiI3k60oMp3` |
| `RESEND_API_KEY` | Resend API key (domain mightyq.film verified) |
| `EMAIL_FROM` | Optional; defaults to `The Mighty Q <hello@mightyq.film>` |
| `TEAM_EMAIL` | Optional; where submission alerts go (default `info@mightyq.film`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile widget keys (domain mightyq.film plus the vercel.app preview domain) |
| `SITE_SECRET` | A long random string (signs upload sessions and file links). Generate: `openssl rand -base64 32` |
| `TEAM_PASSWORD` | Shared password for `/team/files/…` downloads |
| `SITE_URL` | `https://mightyq.film` once the domain is live (used in email links) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` | Sanity project ID and dataset (`production`) |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when the **private** Blob store is connected to the project |

Without the Airtable, Resend or Turnstile keys the site still builds and the pages work; the forms will show an error (or, for Turnstile, skip the check).

## Sanity

1. Create the project at sanity.io/manage (dataset `production`, public).
2. In the project's **API › CORS origins**, add `https://mightyq.film`, the Vercel preview domain and `http://localhost:3000`, with credentials allowed.
3. Set the two `NEXT_PUBLIC_SANITY_*` variables in Vercel and redeploy. Editors sign in at `/studio`.

## Local development

```bash
npm install
vercel env pull .env.local   # or create .env.local by hand
npm run dev
```
