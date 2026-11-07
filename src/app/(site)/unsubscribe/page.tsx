import type { Metadata } from "next";
import { unsubscribe } from "@/app/actions";
import { TokenAction } from "@/components/TokenAction";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <Container className="flex max-w-[760px] flex-col gap-6 pt-16 pb-28">
      <Eyebrow>Unsubscribe</Eyebrow>
      <h1 className="m-0 font-display text-[clamp(40px,5vw,60px)] leading-none font-normal text-gold">Sorry to see you go.</h1>
      <TokenAction token={token} action={unsubscribe} button="Unsubscribe me" intro="Press the button and we won’t email you again." />
    </Container>
  );
}
