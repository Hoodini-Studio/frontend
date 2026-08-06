import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

function apiHostname(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").hostname;
  } catch {
    return "localhost";
  }
}

const hostname = apiHostname();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["next-intl"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname,
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.smylecards.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
