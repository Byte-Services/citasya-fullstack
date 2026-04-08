import { env } from "./env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "",
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BACKEND_URL: env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_GOOGLE_CALENDAR_URL: env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL
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
