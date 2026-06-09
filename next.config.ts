import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Pin the workspace root — a stray parent-dir lockfile otherwise confuses inference.
  turbopack: { root: import.meta.dirname },
  // Wrap every <Link> navigation in document.startViewTransition for a smooth
  // cross-fade between routes (browser-native; no React ViewTransition component
  // needed — it is not exported in this stable React build).
  experimental: { viewTransition: true },
};

export default nextConfig;
