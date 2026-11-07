import Image from "next/image";
import { SignupForm } from "@/components/SignupForm";
import { ButtonLink, Container, Eyebrow, StarRule } from "@/components/ui";
import { getSiteContent } from "@/lib/content";

export const revalidate = 60;

const taglineColors = ["text-gold", "text-rust", "text-ink"];

export default async function HomePage() {
  const { home, wanted, team, settings } = await getSiteContent();

  return (
    <>
      {/* Hero */}
      <section id="top" className="mq-glow border-b border-line-dim">
        <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-14 py-16 sm:py-24">
          <div className="flex min-w-0 flex-col gap-7">
            <p className="m-0 font-mono text-[13px] tracking-[0.08em] text-ink sm:text-base">{home.kicker}</p>
            <h1 className="m-0 font-display text-[clamp(44px,6vw,84px)] leading-none font-normal text-gold">{home.headline}</h1>
            <p className="m-0 font-wood text-[clamp(24px,2.6vw,36px)] leading-[1.1] font-extrabold tracking-[0.02em] uppercase">
              {home.tagline.map((line, i) => (
                <span key={i} className={taglineColors[i % 3]}>
                  {line}{" "}
                </span>
              ))}
            </p>
            <p className="m-0 max-w-[560px] font-serif text-[19px] leading-[1.45] text-ink sm:text-[21px]">{home.lede}</p>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="#signup">Keep me posted</ButtonLink>
              <ButtonLink href="/share" variant="outline">
                Share your Q ★
              </ButtonLink>
            </div>
          </div>

          {home.heroImage ? (
            <figure className="m-0 flex min-w-0 flex-col gap-2.5">
              <Image
                src={home.heroImage.url}
                alt={home.heroImage.alt || ""}
                width={1200}
                height={1500}
                className="block h-auto w-full border border-rule"
                priority
              />
              {home.heroImage.caption ? (
                <figcaption className="font-serif text-sm leading-[1.4] text-ink-muted italic">{home.heroImage.caption}</figcaption>
              ) : null}
            </figure>
          ) : (
            <div className="flex min-w-0 justify-center">
              <Image
                src="/wordmark.jpg"
                alt=""
                width={1070}
                height={930}
                priority
                className="block h-auto w-full max-w-[560px] border border-rule"
              />
            </div>
          )}
        </Container>
      </section>

      {/* Sign-up */}
      <section id="signup" className="scroll-mt-4">
        <Container className="py-14 sm:py-[72px]">
          <SignupForm heading={home.signupHeading} text={home.signupText} senderLine={settings.senderLine} />
        </Container>
      </section>

      {/* Most wanted */}
      <section id="wanted" className="scroll-mt-4 border-t border-line-dim">
        <Container className="flex flex-col gap-12 py-16 sm:py-24">
          <div className="flex max-w-[760px] flex-col gap-4">
            <Eyebrow tone="gold">{home.callEyebrow}</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(38px,4.4vw,60px)] leading-none font-normal text-gold">{home.callHeading}</h2>
            <p className="m-0 font-serif text-[19px] leading-[1.45] text-ink sm:text-[21px]">{home.callLede}</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-6">
            {wanted.map((item, i) => (
              <article
                key={i}
                className={`flex min-w-0 flex-col gap-4 bg-ground-raised p-8 ${item.featured ? "border-2 border-rule-red" : "border border-rule"}`}
              >
                <Eyebrow tone={item.featured ? "red" : "muted"}>{item.eyebrow}</Eyebrow>
                <h3 className="m-0 font-wood text-[34px] leading-none font-extrabold text-gold uppercase">{item.label}</h3>
                <StarRule />
                <p className="m-0 text-[17px] leading-normal text-ink">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-12 gap-y-6 pt-2">
            {home.sendItems.map((item, i) => (
              <div key={i} className="flex min-w-0 flex-col gap-2.5">
                <h3 className="m-0 font-condensed text-[26px] leading-[1.1] font-bold text-ink-bright uppercase">{item.heading}</h3>
                <p className="m-0 text-[17px] leading-normal text-ink">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-rule pt-8">
            <ButtonLink href="/share">Share your tapes, photos &amp; stories</ButtonLink>
            <p className="m-0 flex-[1_1_320px] font-serif text-base leading-[1.45] text-ink-muted italic">
              We digitize anything you lend us at our cost, return the originals and credit you.
            </p>
          </div>
        </Container>
      </section>

      {/* The film */}
      <section id="film" className="scroll-mt-4 border-y border-rule bg-panel">
        <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-14 py-16 sm:py-24">
          <div className="flex min-w-0 flex-col gap-5">
            <Eyebrow>The film</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(36px,4vw,56px)] leading-none font-normal text-gold">{home.filmHeading}</h2>
            <p className="m-0 font-serif text-[19px] leading-[1.45] text-ink sm:text-[21px]">{home.filmLede}</p>
            <p className="m-0 text-lg leading-[1.55] text-ink">{home.filmBody}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-7">
            <Eyebrow tone="gold">Who’s making it</Eyebrow>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-7">
              {team.map((m, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="text-[13px] tracking-[0.12em] text-gold uppercase">{m.role}</span>
                  <span className="font-wood text-[30px] leading-[1.1] font-bold text-ink-bright">{m.name}</span>
                  {m.bio ? <span className="text-base leading-[1.45] text-ink">{m.bio}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
