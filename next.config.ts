import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/memoire",
        destination: "/histoire",
        permanent: true,
      },
      {
        source: "/memoire/:path*",
        destination: "/histoire",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
