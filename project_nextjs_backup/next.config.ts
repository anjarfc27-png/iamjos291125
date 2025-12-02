import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set turbopack root to fix workspace root inference issue
  // This ensures Next.js knows where the project root is located
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  turbopack: {
    root: path.resolve(__dirname),
  } as any,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
