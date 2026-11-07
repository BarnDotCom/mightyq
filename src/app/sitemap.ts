import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mightyq.film";
  return ["", "/share", "/privacy", "/terms"].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" }));
}
