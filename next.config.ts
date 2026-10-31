import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Book covers are hosted on imgbb (and other user-supplied https hosts), so they are rendered
  // unoptimized; remotePatterns still has to allow the host for next/image.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
