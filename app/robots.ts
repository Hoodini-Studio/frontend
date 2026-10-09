import type { MetadataRoute } from "next";
import { getSiteUrl, shouldAllowSearchIndexing } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  // Preview/dev deployments: block crawling so they never compete with production.
  if (!shouldAllowSearchIndexing()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account-settings/",
        "/checkout",
        "/cart",
        "/orders",
        "/favourites",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/profile",
        "/newsletter/unsubscribe",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
