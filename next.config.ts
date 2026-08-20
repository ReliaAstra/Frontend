import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin the turbopack workspace root to this repo (ignores stray lockfiles above it)
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  // Allow the Arena/E2B preview proxy host to load dev-mode assets (HMR etc.)
  allowedDevOrigins: ["*.e2b.app"],
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;

