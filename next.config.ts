import type { NextConfig } from "next";

// Allow next/image to load pictures from this project's public
// product-images bucket in Supabase Storage (and nowhere else).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const imagePatterns = supabaseUrl
  ? [new URL("/storage/v1/object/public/product-images/**", supabaseUrl)]
  : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imagePatterns,
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
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
