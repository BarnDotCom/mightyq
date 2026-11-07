import type { Metadata } from "next";
import { confirmSubscription } from "@/app/actions";
import { TokenAction } from "@/components/TokenAction";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Confirm", robots: { index: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <Container className="flex max-w-[760px] flex-col gap-6 pt-16 pb-28">
      <Eyebrow>Keep me posted</Eyebrow>
      <h1 className="m-0 font-display text-[clamp(40px,5vw,60px)] leading-none font-normal text-gold">One last click.</h1>
      <TokenAction
        token={token}
        action={confirmSubscription}
        button="Yes, keep me posted"
        intro="Confirm you’d like email about The Mighty Q: news about the film, the call for tapes and the fiftieth."
      />
    </Container>
  );
}
