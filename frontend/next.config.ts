import type { NextConfig } from "next";

// Private backend origin. Server Components call it directly; browser requests
// to /api/v1/* and /api/auth/* reach it through the rewrites below so they
// stay same-origin (first-party cookies, no CORS, backend URL never exposed).
// /uploads/* serves images uploaded through the admin tools.
const backendUrl = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Admin image uploads go through a Server Action (backend limit: 5 MB).
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Product and editorial imagery (catalog image URLs come from the API).
    // Object form with no `search` key so sizing query params are allowed.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async rewrites() {
    if (!backendUrl) return [];
    return [
      { source: "/api/v1/:path*", destination: `${backendUrl}/api/v1/:path*` },
      { source: "/api/auth/:path*", destination: `${backendUrl}/api/auth/:path*` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ];
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
