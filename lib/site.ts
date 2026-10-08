export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@hoodini.studio";

/** Set NEXT_PUBLIC_INSTAGRAM_URL to enable the Instagram link in the footer. */
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null;

/** Canonical production origin (no trailing slash). */
export const PRODUCTION_SITE_URL = "https://hoodini.studio";

/**
 * Public site origin for metadataBase, canonicals, sitemap, and robots.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (set explicitly in production)
 * 2. Vercel preview deployment host (so preview does not emit production URLs)
 * 3. Production default
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  }

  return PRODUCTION_SITE_URL;
}

/**
 * Preview/development Vercel deployments must not compete with production in search.
 * Non-Vercel (local) defaults to indexable metadata for production-like builds.
 */
export function shouldAllowSearchIndexing(): boolean {
  const env = process.env.VERCEL_ENV;
  if (env === "preview" || env === "development") {
    return false;
  }
  return true;
}
