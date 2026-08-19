import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["preview-chat-69b3eede-1090-4ebd-ace8-fa93a6dfa834.space-z.ai"],
};

export default nextConfig;
