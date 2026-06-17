import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js to produce a standalone build — optimal for Vercel
  output: "standalone",

  // Make the backend URL available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },

  // Allow images from any HTTPS source (for avatars etc.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
