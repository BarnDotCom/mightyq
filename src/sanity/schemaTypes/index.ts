import { defineArrayMember, defineField, defineType } from "sanity";

/*
 * Everything here is public content. Nothing personal (emails, submissions)
 * ever goes into Sanity: the free plan's datasets are public.
 */

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Site title", type: "string", initialValue: "The Mighty Q" }),
    defineField({
      name: "description",
      title: "Description (search results and link previews)",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "ogImage", title: "Link-preview image (1200 × 630)", type: "image" }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string", initialValue: "info@mightyq.film" }),
    defineField({
      name: "senderLine",
      title: "Sender line (who sends our emails, and a mailing address)",
      description: "Required by Canada's anti-spam law (CASL). Shown under the sign-up form and in every email.",
      type: "string",
    }),
    defineField({
      name: "announcement",
      title: "Announcement bar (optional)",
      description: "A short line across the top of every page. Leave blank to hide.",
      type: "string",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "signup", title: "Sign-up" },
    { name: "call", title: "Call for recordings" },
    { name: "film", title: "The film" },
  ],
  fields: [
    defineField({ name: "kicker", type: "string", group: "hero" }),
    defineField({ name: "headline", type: "string", group: "hero" }),
    defineField({
      name: "tagline",
      title: "Tagline (three short lines)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.max(3),
      group: "hero",
    }),
    defineField({ name: "lede", type: "text", rows: 3, group: "hero" }),
    defineField({
      name: "heroImage",
      title: "Hero image (optional: the wordmark shows if empty)",
      description: "Only cleared images. No Q107 logo or marks until Corus agrees.",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt text", type: "string" }),
        defineField({ name: "caption", title: "Caption (who, where, month, year)", type: "string" }),
      ],
      group: "hero",
    }),
    defineField({ name: "signupHeading", type: "string", group: "signup" }),
    defineField({ name: "signupText", type: "text", rows: 2, group: "signup" }),
    defineField({ name: "callEyebrow", type: "string", group: "call" }),
    defineField({ name: "callHeading", type: "string", group: "call" }),
    defineField({ name: "callLede", type: "text", rows: 3, group: "call" }),
    defineField({
      name: "sendItems",
      title: "What you can send",
      type: "array",
      group: "call",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "heading", type: "string" }),
            defineField({ name: "text", type: "text", rows: 2 }),
          ],
        }),
      ],
    }),
    defineField({ name: "filmHeading", type: "string", group: "film" }),
    defineField({ name: "filmLede", type: "text", rows: 3, group: "film" }),
    defineField({ name: "filmBody", type: "text", rows: 4, group: "film" }),
    defineField({ name: "banner", title: "Closing banner", type: "string", group: "film" }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});

const wantedItem = defineType({
  name: "wantedItem",
  title: "Most wanted",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Date or label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "eyebrow",
      type: "string",
      options: { list: ["MOST WANTED", "WANTED", "ANYTHING"] },
      initialValue: "WANTED",
    }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "featured", title: "Featured (red border)", type: "boolean", initialValue: false }),
    defineField({
      name: "found",
      title: "Found it! (hides it from the site)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "order", type: "number" }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "label", subtitle: "description" } },
});

const teamMember = defineType({
  name: "teamMember",
  title: "Team",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "bio", title: "Short bio (optional)", type: "text", rows: 2 }),
    defineField({
      name: "visible",
      title: "Show on the site",
      description: "Only once they've agreed to be named.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({ name: "order", type: "number" }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "role" } },
});

const legalPage = defineType({
  name: "legalPage",
  title: "Legal pages",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      description: "Use 'privacy' or 'terms'.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "updated", title: "Last updated", type: "date" }),
    defineField({ name: "body", type: "array", of: [defineArrayMember({ type: "block" })] }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const schemaTypes = [siteSettings, homePage, wantedItem, teamMember, legalPage];
export const singletonTypes = new Set(["siteSettings", "homePage"]);
