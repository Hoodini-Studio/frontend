"use client";

import dynamic from "next/dynamic";

/**
 * Load Vercel analytics only in production so local/e2e HMR is not disrupted
 * by missing analytics chunks during Next.js Fast Refresh.
 */
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false },
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

export function VercelMetrics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
