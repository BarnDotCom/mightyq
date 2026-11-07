import type { ReactNode } from "react";

/*
 * Built-in text for the legal pages, used until a "Legal pages" document with the
 * same slug is published in Sanity. ⚠ Have it checked before relying on it.
 */

export const defaultLegal: Record<string, { title: string; updated: string; body: ReactNode }> = {
  privacy: {
    title: "Privacy",
    updated: "2026-11-07",
    body: (
      <>
        <p>
          This site is run by the team making <em>The Mighty Q</em>, a documentary about Q107. This page explains what we collect, why,
          and what you can ask us to do with it.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>If you sign up for news:</strong> your email address, the date and time you agreed, the wording of the box you ticked,
            and your internet address, as a record of your consent.
          </li>
          <li>
            <strong>If you share something:</strong> your name, email, phone number if you give one, what you tell us, and any files or
            links you send.
          </li>
          <li>
            <strong>When you visit:</strong> anonymous page counts (no cookies, nothing that identifies you), and a spam check from
            Cloudflare that runs when you use a form.
          </li>
        </ul>
        <h2>Why</h2>
        <p>
          To send you news about the film if you asked for it, to read and reply to what you share, and to ask your permission if we’d
          like to use something in the film. We don’t sell or rent your details, and we don’t use them for anything else.
        </p>
        <h2>Where it’s kept</h2>
        <p>
          With the services that run this site: Vercel (the website and uploaded files), Airtable (the list of sign-ups and
          submissions), Resend (sending email) and Cloudflare (the spam check). Some of them store data in the United States. Only the
          people making the film can see what you send.
        </p>
        <h2>How long</h2>
        <p>
          Sign-ups: until you unsubscribe. Submissions: for as long as we’re making and distributing the film, unless you ask us to
          delete them sooner.
        </p>
        <h2>Your choices</h2>
        <p>
          Every email has an unsubscribe link. To see, correct or delete what we hold about you, write to{" "}
          <a href="mailto:info@mightyq.film">info@mightyq.film</a>.
        </p>
      </>
    ),
  },
  terms: {
    title: "Submission terms",
    updated: "2026-11-07",
    body: (
      <>
        <p>Thank you for sharing your piece of Q107 with us. Here’s what sending something does, and doesn’t, mean.</p>
        <h2>Sending isn’t permission to use</h2>
        <p>
          Sending us a file, a link or a story lets us look at it, listen to it and keep a copy while we make the film. It doesn’t give
          us the right to put it in the film or anywhere else. If we’d like to use it, we’ll contact you first and ask for your
          permission and a signed release.
        </p>
        <h2>Please only send what’s yours to share</h2>
        <p>
          When you tick the box, you’re telling us the material is yours, or that you have permission from whoever owns it. Off-air
          recordings of broadcasts are welcome: we’ll sort out the rights to the broadcast itself with its owner.
        </p>
        <h2>Lending originals</h2>
        <p>
          If you lend us a tape, photo or object, we’ll arrange how it gets to us, digitize it at our cost, return it, and credit you if
          it’s used.
        </p>
        <h2>Changing your mind</h2>
        <p>
          Write to <a href="mailto:info@mightyq.film">info@mightyq.film</a> and we’ll delete what you sent.
        </p>
      </>
    ),
  },
};
