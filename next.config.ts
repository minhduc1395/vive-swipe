import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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

export default withNextIntl(nextConfig);
