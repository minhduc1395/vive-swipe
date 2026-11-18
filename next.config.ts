import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dsrejhghgbvnwgxpdhee.supabase.co",
        pathname: "/storage/v1/object/public/media/**",
      },
    ],
  },
};

export default nextConfig;
