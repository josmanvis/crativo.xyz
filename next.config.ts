import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  webpack: (config) => {
    config.externals = [...(config.externals as string[] || []), { canvas: "canvas" }];
    return config;
  },
};

export default nextConfig;
