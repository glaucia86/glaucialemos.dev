import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The locale segment owns each document's html/lang. Global 404s need
  // their own document rather than a not-found boundary without a layout.
  experimental: { globalNotFound: true },
};

export default nextConfig;
