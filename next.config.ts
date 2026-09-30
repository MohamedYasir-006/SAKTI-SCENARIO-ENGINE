import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin tracing root: parent folders contain unrelated stray lockfiles.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
