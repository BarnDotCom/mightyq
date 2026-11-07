import Image from "next/image";
import Link from "next/link";
import { Container, OnAirBadge } from "./ui";

export function Header({ announcement }: { announcement?: string }) {
  return (
    <header className="border-b border-rule bg-panel">
      {announcement ? (
        <p className="m-0 bg-red px-4 py-2 text-center font-condensed text-sm font-bold tracking-[0.08em] text-ink-bright uppercase">
          {announcement}
        </p>
      ) : null}
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-2">
        <Link href="/" aria-label="The Mighty Q — home" className="block leading-none">
          <Image src="/wordmark.jpg" alt="The Mighty Q" width={1070} height={930} priority className="block h-14 w-auto" />
        </Link>
        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-x-7 gap-y-1 font-serif text-[13px] font-bold tracking-[0.2em] uppercase"
        >
          <Link href="/#film" className="hidden py-3 text-ink no-underline hover:text-gold-bright sm:inline">
            The film
          </Link>
          <Link href="/#wanted" className="hidden py-3 text-ink no-underline hover:text-gold-bright sm:inline">
            Most wanted
          </Link>
          <Link href="/share" className="py-3 text-ink no-underline hover:text-gold-bright">
            Share your Q
          </Link>
          <Link href="/#contact" className="hidden py-3 text-ink no-underline hover:text-gold-bright md:inline">
            Contact
          </Link>
          <span className="hidden sm:inline-flex">
            <OnAirBadge />
          </span>
        </nav>
      </Container>
    </header>
  );
}

export function Footer({ banner, contactEmail }: { banner: string; contactEmail: string }) {
  return (
    <footer id="contact" className="bg-ground">
      <Container className="flex flex-col gap-10 pt-16 pb-12">
        <div className="flex items-center gap-4 border border-rule px-6 py-3.5 font-serif text-[15px] font-bold tracking-[0.12em] text-gold uppercase">
          <span aria-hidden="true" className="text-xl tracking-normal">
            ★
          </span>
          {banner}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex flex-col gap-3">
            <Image src="/wordmark.jpg" alt="The Mighty Q" width={1070} height={930} className="block h-16 w-auto self-start" />
            <span className="font-serif text-sm text-ink-muted italic">
              © {new Date().getFullYear()} The Mighty Q. A feature documentary in development.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] tracking-[0.12em] text-gold uppercase">Write to us</span>
            <a href={`mailto:${contactEmail}`} className="font-wood text-[26px] font-bold text-ink-bright no-underline hover:text-gold-bright">
              {contactEmail}
            </a>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1 text-base">
            <Link href="/privacy" className="py-3 text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="py-3 text-ink">
              Submission terms
            </Link>
            <Link href="/share" className="py-3 text-ink">
              Share your Q
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
