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
};

export default nextConfig;
