import Link from "next/link";
import type { ReactNode } from "react";

/* Small building blocks from the Mighty Q design system. */

export function Eyebrow({ children, tone = "red", className = "" }: { children: ReactNode; tone?: "red" | "gold" | "muted"; className?: string }) {
  const color = tone === "red" ? "text-red-label" : tone === "gold" ? "text-gold" : "text-ink-muted";
  return (
    <p className={`m-0 font-serif text-[13px] font-bold tracking-[0.2em] uppercase ${color} ${className}`}>{children}</p>
  );
}

export function StarRule({ className = "" }: { className?: string }) {
  return (
    <div className={`mq-star ${className}`} aria-hidden="true">
      ★
    </div>
  );
}

export function OnAirBadge() {
  return (
    <span className="inline-flex items-center gap-2 border-2 border-oxblood px-3 py-1.5 font-narrow text-sm leading-none font-bold tracking-[0.06em] text-ink-bright">
      <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-red-signal" />
      ON AIR
    </span>
  );
}

const buttonBase =
  "inline-flex min-h-[52px] items-center justify-center px-7 font-condensed text-lg font-bold tracking-[0.06em] uppercase no-underline transition-colors";

export function ButtonLink({ href, children, variant = "red" }: { href: string; children: ReactNode; variant?: "red" | "outline" }) {
  const style =
    variant === "red"
      ? "bg-red text-ink-bright hover:bg-[#c43a2a] hover:text-ink-bright"
      : "border border-rule text-gold-bright hover:border-gold-bright hover:text-ink-bright";
  return (
    <Link href={href} className={`${buttonBase} ${style}`}>
      {children}
    </Link>
  );
}

export function SubmitButton({ children, pending, className = "" }: { children: ReactNode; pending?: boolean; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${buttonBase} cursor-pointer border-0 bg-red text-ink-bright hover:bg-[#c43a2a] disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {pending ? "Sending…" : children}
    </button>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1240px] px-4 sm:px-8 ${className}`}>{children}</div>;
}
