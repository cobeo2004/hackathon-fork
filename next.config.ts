import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Pin the workspace root — a stray parent-dir lockfile otherwise confuses inference.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
