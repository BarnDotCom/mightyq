"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import { SubmitButton } from "./ui";

/*
 * Confirm / unsubscribe pages. The change happens on a button press, not on page
 * load, so email link-scanners can't confirm or unsubscribe anyone by accident.
 */
export function TokenAction({
  token,
  action,
  button,
  intro,
}: {
  token: string;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  button: string;
  intro: string;
}) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(action, null);

  if (state) {
    return (
      <div role="status" className="flex flex-col gap-5">
        <p className={`m-0 font-serif text-[21px] leading-[1.45] ${state.ok ? "text-ink" : "text-red-label"}`}>{state.message}</p>
        <Link href="/" className="self-start">
          Back to the film
        </Link>
      </div>
    );
  }

  return (
    <form action={dispatch} className="flex flex-col items-start gap-6">
      <p className="m-0 font-serif text-[21px] leading-[1.45] text-ink">{intro}</p>
      <input type="hidden" name="token" value={token} />
      <SubmitButton pending={pending}>{button}</SubmitButton>
    </form>
  );
}
