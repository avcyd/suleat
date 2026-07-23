import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow arbitrary http(s) cover / offer image URLs from merchant data.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
