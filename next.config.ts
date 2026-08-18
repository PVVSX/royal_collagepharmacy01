import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Commented out for standard Vercel deployment
  allowedDevOrigins: ["wheat-concert-litmus.ngrok-free.dev", "127.0.0.1"],
  devIndicators: false,
};

export default nextConfig;
