import { PortableText } from "next-sanity";
import { Container, Eyebrow } from "./ui";
import { getLegalPage } from "@/lib/content";
import { defaultLegal } from "@/lib/legal";

export async function LegalPageView({ slug }: { slug: "privacy" | "terms" }) {
  const fromCms = await getLegalPage(slug);
  const fallback = defaultLegal[slug];
  const title = fromCms?.title || fallback.title;
  const updated = fromCms?.updated || fallback.updated;

  return (
    <Container className="flex max-w-[820px] flex-col gap-6 pt-14 pb-24">
      <Eyebrow tone="gold">The Mighty Q</Eyebrow>
      <h1 className="m-0 font-display text-[clamp(40px,5vw,60px)] leading-none font-normal text-gold">{title}</h1>
      <p className="m-0 font-serif text-sm text-ink-muted italic">Last updated {updated}</p>
      <div className="mq-prose">{fromCms?.body?.length ? <PortableText value={fromCms.body} /> : fallback.body}</div>
    </Container>
  );
}
