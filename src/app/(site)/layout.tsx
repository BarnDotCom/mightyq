import type { Metadata } from "next";
import { Footer, Header } from "@/components/SiteChrome";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  return {
    title: { default: `${settings.title} — a documentary about Q107`, template: `%s — ${settings.title}` },
    description: settings.description,
    openGraph: {
      title: settings.title,
      description: settings.description,
      url: "https://mightyq.film",
      siteName: settings.title,
      locale: "en_CA",
      type: "website",
      images: [{ url: settings.ogImage || "/wordmark.jpg" }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, home } = await getSiteContent();
  return (
    <div className="flex min-h-screen flex-col bg-ground text-ink">
      <Header announcement={settings.announcement} />
      <main className="flex-1">{children}</main>
      <Footer banner={home.banner} contactEmail={settings.contactEmail} />
    </div>
  );
}
