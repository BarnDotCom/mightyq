"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribe, type FormState } from "@/app/actions";
import { Captcha } from "./Captcha";
import { Eyebrow, SubmitButton } from "./ui";

export function SignupForm({ heading, text, senderLine }: { heading: string; text: string; senderLine: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, null);

  return (
    <form
      action={action}
      className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-x-14 gap-y-8 border border-rule bg-ground-raised p-6 sm:p-10"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <Eyebrow>Keep me posted</Eyebrow>
        <h2 className="m-0 font-wood text-[40px] leading-[1.05] font-extrabold tracking-[0.02em] text-gold uppercase">{heading}</h2>
        <p className="m-0 text-lg leading-normal text-ink">{text}</p>
      </div>

      {state?.ok ? (
        <div role="status" className="flex min-w-0 flex-col gap-2 border border-gold p-6">
          <p className="m-0 font-condensed text-2xl font-bold text-ink-bright uppercase">Check your email ★</p>
          <p className="m-0 text-lg text-ink">{state.message}</p>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-4">
          <input type="hidden" name="source" value="home" />
          <label className="sr-only-field" aria-hidden="true">
            Leave this empty
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <div className="flex flex-wrap gap-3">
            <label htmlFor="signup-email" className="sr-only">
              Email address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mq-input min-w-0 flex-[1_1_260px] bg-ground-raised"
            />
            <SubmitButton pending={pending}>Sign me up</SubmitButton>
          </div>
          <label className="flex items-start gap-3 text-base leading-[1.45] text-ink">
            <input className="mq-check" type="checkbox" name="consent" required />
            <span>
              Yes, send me email about <em>The Mighty Q</em>. I can unsubscribe at any time.
            </span>
          </label>
          <Captcha />
          {state && !state.ok ? (
            <p role="alert" className="m-0 font-bold text-red-label">
              {state.message}
            </p>
          ) : null}
          <p className="m-0 font-serif text-sm leading-[1.45] text-ink-muted italic">
            We’ll send one email to confirm. Sent by {senderLine}. <Link href="/privacy">Privacy</Link>.
          </p>
        </div>
      )}
    </form>
  );
}
