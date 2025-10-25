import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable service worker to prevent 404 errors
  experimental: {
    // Disable service worker
  },
  // Add headers to prevent service worker requests
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Allow external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pec.ac.in',
      },
    ],
  },
};

export default nextConfig;
