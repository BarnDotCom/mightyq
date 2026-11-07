import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { apiVersion, dataset, projectId, sanityConfigured } from "@/sanity/env";

/*
 * Site copy. Sanity is the source once it's connected; until then (and for any
 * field left empty in the Studio) the defaults below are used, so the site never
 * shows a blank.
 */

export type WantedItem = { label: string; eyebrow: string; description: string; featured?: boolean };
export type TeamMember = { name: string; role: string; bio?: string };
export type SendItem = { heading: string; text: string };
export type HeroImage = { url: string; alt?: string; caption?: string } | null;

export type SiteContent = {
  settings: {
    title: string;
    description: string;
    contactEmail: string;
    senderLine: string;
    announcement?: string;
    ogImage?: string;
  };
  home: {
    kicker: string;
    headline: string;
    tagline: string[];
    lede: string;
    heroImage: HeroImage;
    signupHeading: string;
    signupText: string;
    callEyebrow: string;
    callHeading: string;
    callLede: string;
    sendItems: SendItem[];
    filmHeading: string;
    filmLede: string;
    filmBody: string;
    banner: string;
  };
  wanted: WantedItem[];
  team: TeamMember[];
};

export const defaults: SiteContent = {
  settings: {
    title: "The Mighty Q",
    description:
      "A feature documentary about Q107, Toronto’s rock station, and the people who made it — for the station’s fiftieth in 2027. Did you tape the Q? Share your tapes, photos and stories.",
    contactEmail: "info@mightyq.film",
    senderLine: "[Production company], [mailing address]",
  },
  home: {
    kicker: "A FEATURE DOCUMENTARY • IN DEVELOPMENT",
    headline: "Do you remember rock and roll radio?",
    tagline: ["Before playlists.", "Before algorithms.", "Before influencers."],
    lede: "The Mighty Q is a feature documentary about Q107, Toronto’s rock station, and the people who made it — coming for the station’s fiftieth birthday in 2027.",
    heroImage: null,
    signupHeading: "Be first to hear.",
    signupText: "News about the film, the call for tapes and the fiftieth. A few emails a year, never more.",
    callEyebrow: "THE CALL FOR RECORDINGS",
    callHeading: "Did you tape the Q?",
    callLede:
      "Radio was never meant to be kept. Much of it survives only because a listener pressed record. If you, your parents or your older brother taped Q107, you may be holding a piece of Toronto history.",
    sendItems: [
      {
        heading: "Tapes & airchecks.",
        text: "Cassettes, reels, MP3s of old transfers. Send a file, or tell us what you have and we’ll digitize it.",
      },
      {
        heading: "Photos & memorabilia.",
        text: "T-shirts, bumper stickers, posters, contest prizes, Homegrown albums, snapshots from the shows.",
      },
      {
        heading: "Stories & memories.",
        text: "Where you were when you heard it. The contest you won. The night you were in the studio.",
      },
    ],
    filmHeading: "Who made the Mighty Q?",
    filmLede:
      "Many people — starting with a showman from the prairies, and the city itself. Everyone has a claim. The film lets them make it.",
    filmBody:
      "The characters behind the microphones, the bands they went looking for, and a city that listened together on one analog dial. Told by the people who were there, then and now, with rock-and-roll animation for the stories nobody filmed.",
    banner: "Made with the people who were there.",
  },
  wanted: [
    {
      label: "Dec 8, 1980",
      eyebrow: "MOST WANTED",
      description: "The night John Lennon died. Q stayed on the air all night and into the next day.",
      featured: true,
    },
    { label: "Aug 16, 1977", eyebrow: "WANTED", description: "The night Elvis died, when the station was twelve weeks old." },
    { label: "Halloween 1980", eyebrow: "WANTED", description: "Teenage Head live at Heatwave, as the station broadcast it." },
    {
      label: "1977–1989",
      eyebrow: "ANYTHING",
      description: "Whole shifts, jingles, contests, ads, live concerts — even a few minutes taped off the radio.",
    },
  ],
  team: [
    { name: "Jeff Rogers", role: "Director" },
    { name: "Barnaby Marshall", role: "Producer" },
    { name: "Rob Stefaniuk", role: "Producer" },
  ],
};

const client = sanityConfigured ? createClient({ projectId, dataset, apiVersion, useCdn: true }) : null;
const imageBuilder = sanityConfigured ? createImageUrlBuilder({ projectId, dataset }) : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function imageUrl(source: any, width: number): string | undefined {
  if (!source?.asset || !imageBuilder) return undefined;
  return imageBuilder.image(source).width(width).auto("format").url();
}

const QUERY = `{
  "settings": *[_id == "siteSettings"][0],
  "home": *[_id == "homePage"][0],
  "wanted": *[_type == "wantedItem" && found != true] | order(order asc){label, eyebrow, description, featured},
  "team": *[_type == "teamMember" && visible != false] | order(order asc){name, role, bio}
}`;

/** Use the Sanity value if it's filled in, otherwise the default. */
function pick<T>(value: T | null | undefined, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  if (Array.isArray(value) && value.length === 0) return fallback;
  return value;
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!client) return defaults;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await client.fetch(QUERY, {}, { next: { revalidate: 60, tags: ["sanity"] } });
    const s = data?.settings ?? {};
    const h = data?.home ?? {};
    const d = defaults;
    return {
      settings: {
        title: pick(s.title, d.settings.title),
        description: pick(s.description, d.settings.description),
        contactEmail: pick(s.contactEmail, d.settings.contactEmail),
        senderLine: pick(s.senderLine, d.settings.senderLine),
        announcement: s.announcement || undefined,
        ogImage: imageUrl(s.ogImage, 1200),
      },
      home: {
        kicker: pick(h.kicker, d.home.kicker),
        headline: pick(h.headline, d.home.headline),
        tagline: pick(h.tagline, d.home.tagline),
        lede: pick(h.lede, d.home.lede),
        heroImage: h.heroImage?.asset
          ? { url: imageUrl(h.heroImage, 1200)!, alt: h.heroImage.alt, caption: h.heroImage.caption }
          : null,
        signupHeading: pick(h.signupHeading, d.home.signupHeading),
        signupText: pick(h.signupText, d.home.signupText),
        callEyebrow: pick(h.callEyebrow, d.home.callEyebrow),
        callHeading: pick(h.callHeading, d.home.callHeading),
        callLede: pick(h.callLede, d.home.callLede),
        sendItems: pick(h.sendItems, d.home.sendItems),
        filmHeading: pick(h.filmHeading, d.home.filmHeading),
        filmLede: pick(h.filmLede, d.home.filmLede),
        filmBody: pick(h.filmBody, d.home.filmBody),
        banner: pick(h.banner, d.home.banner),
      },
      wanted: pick(data?.wanted, d.wanted),
      team: pick(data?.team, d.team),
    };
  } catch (err) {
    console.error("Sanity fetch failed; using defaults", err);
    return defaults;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LegalPage = { title: string; updated?: string; body: any[] } | null;

export async function getLegalPage(slug: string): Promise<LegalPage> {
  if (!client) return null;
  try {
    return await client.fetch(
      `*[_type == "legalPage" && slug.current == $slug][0]{title, updated, body}`,
      { slug },
      { next: { revalidate: 60, tags: ["sanity"] } },
    );
  } catch {
    return null;
  }
}
