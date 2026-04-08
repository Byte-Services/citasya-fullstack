import type { NextConfig } from "next";
import path from "path";
import { env } from "./env.mjs";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BACKEND_URL: env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_GOOGLE_CALENDAR_URL: env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL,
  },  
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindcss.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
