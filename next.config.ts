import type { NextConfig } from "next";
import { REDIRECTS } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return REDIRECTS;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rv-armor.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
