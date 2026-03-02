import type { NextConfig } from "next";

/**
 * Static export is incompatible with dynamic, backend-driven pages like `/residents/[id]`
 * unless all IDs are known at build time (generateStaticParams returns full list).
 *
 * For step 1 (frontend implementation), we keep standard Next.js output to allow
 * dynamic routes while backend APIs are implemented in subsequent steps.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
