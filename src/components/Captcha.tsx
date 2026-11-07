"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { Ref } from "react";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

/** Cloudflare's spam check. Mostly invisible; adds `cf-turnstile-response` to the form. Renders nothing until a key is set. */
export function Captcha({ onSuccess, ref }: { onSuccess?: (token: string) => void; ref?: Ref<TurnstileInstance | undefined> }) {
  if (!siteKey) return null;
  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      onSuccess={onSuccess}
      options={{ theme: "dark", size: "flexible", appearance: "interaction-only" }}
    />
  );
}

export const captchaEnabled = Boolean(siteKey);
