import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gateway.irys.xyz" },
      { protocol: "https", hostname: "*.arweave.net" },
    ],
  },
};

export default nextConfig;
