import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [
      // Short link for the Toronto Mike'd show notes; tagged so analytics can count it.
      {
        source: "/mike",
        destination: "/?utm_source=torontomiked&utm_medium=podcast&utm_campaign=launch",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
