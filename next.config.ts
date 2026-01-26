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
  async redirects() {
    return [
      {
        source: '/ads.txt',
        destination: 'https://srv.adstxtmanager.com/19390/crativo.xyz',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
