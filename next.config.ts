import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: process.env.COVERAGE === "true",
  webpack: (config) => {
    if (process.env.COVERAGE === "true") {
      // Disable minification so V8 coverage can detect branches/functions
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
