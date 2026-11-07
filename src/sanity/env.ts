export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-11-01";

/** True once the Sanity project ID is set in Vercel. Until then the site uses the built-in copy. */
export const sanityConfigured = Boolean(projectId);
