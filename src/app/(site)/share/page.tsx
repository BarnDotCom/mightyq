import type { Metadata } from "next";
import { ShareForm } from "@/components/ShareForm";
import { Container, Eyebrow, StarRule } from "@/components/ui";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Share your Q",
  description: "Tapes, photos, T-shirts, stories. If you were listening to Q107, you were part of it. Tell us what you have.",
};

export default async function SharePage() {
  const { wanted, settings } = await getSiteContent();
  const featured = wanted.find((w) => w.featured) ?? wanted[0];

  return (
    <Container className="flex flex-col gap-12 pt-14 pb-24 sm:pt-[72px]">
      <div className="flex max-w-[780px] flex-col gap-4">
        <Eyebrow>Tapes • Photos • Stories</Eyebrow>
        <h1 className="m-0 font-display text-[clamp(44px,5vw,68px)] leading-none font-normal text-gold">Share your Q.</h1>
        <p className="m-0 font-serif text-[19px] leading-[1.45] text-ink sm:text-[21px]">
          If you were listening, you were part of it. Tell us what you have — a tape, a T-shirt, a photo, or just the story of where you
          were. <span className="text-gold-bright">It takes about five minutes.</span>
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-12">
        <div className="min-w-0 flex-[999_1_620px]">
          <ShareForm />
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <div className="flex flex-col gap-4 border border-rule p-7">
            <Eyebrow tone="gold">What happens next</Eyebrow>
            {[
              ["We read everything.", "Every submission goes to the three of us making the film."],
              ["We’ll write back.", "If it’s something we’d love to hear or see more of, we’ll be in touch."],
              ["Originals come home.", "We digitize at our cost, return what you lend us, and credit you."],
            ].map(([h, t], i) => (
              <div key={i} className="flex flex-col gap-4">
                {i > 0 ? <StarRule /> : null}
                <div className="flex flex-col gap-1.5">
                  <span className="font-condensed text-xl font-bold text-ink-bright uppercase">{h}</span>
                  <span className="text-base leading-[1.45] text-ink">{t}</span>
                </div>
              </div>
            ))}
          </div>
          {featured ? (
            <div className="flex flex-col gap-3 border-2 border-rule-red bg-ground-raised p-7">
              <Eyebrow>{featured.eyebrow}</Eyebrow>
              <span className="font-wood text-[28px] leading-none font-extrabold text-gold uppercase">{featured.label}</span>
              <span className="text-base leading-[1.45] text-ink">{featured.description}</span>
            </div>
          ) : null}
          <p className="m-0 text-base leading-normal text-ink-muted">
            Rather talk? Write to <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>.
          </p>
        </aside>
      </div>
    </Container>
  );
}
