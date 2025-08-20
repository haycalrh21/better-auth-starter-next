import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,

    cacheLife: {
      blog: {
        stale: 60, // 1 jam
        revalidate: 30, // 15 menit
        expire: 3600, // 1 hari
      },
    },
  },
};
export default nextConfig;
