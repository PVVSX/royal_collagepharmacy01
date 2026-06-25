import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Commented out for standard Vercel deployment
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
