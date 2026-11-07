import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { sanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main style={{ padding: 48, fontFamily: "system-ui", color: "#e6d6b6", background: "#080705", minHeight: "100vh" }}>
        <h1>Studio not connected yet</h1>
        <p>Add NEXT_PUBLIC_SANITY_PROJECT_ID in Vercel, then redeploy.</p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
