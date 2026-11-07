import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/team", "/api", "/confirm", "/unsubscribe"] }],
    sitemap: "https://mightyq.film/sitemap.xml",
  };
}
