import type { MetadataRoute } from "next";
import { getSiteUrl, shouldAllowSearchIndexing } from "@/lib/site";

/**
 * Product/pack URLs come from the public catalog APIs, which only return
 * published items. Requires `NEXT_PUBLIC_API_URL` in production so the
 * Next server can reach the Laravel API at build/runtime (ISR revalidate: 1h).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SlugListPayload = {
  data?: Array<{ slug: string; updated_at?: string }>;
  meta?: { last_page?: number };
};

async function fetchPublishedSlugs(path: string): Promise<
  Array<{ slug: string; updatedAt?: string }>
> {
  const items: Array<{ slug: string; updatedAt?: string }> = [];

  try {
    let page = 1;
    let lastPage = 1;

    do {
      const response = await fetch(
        `${API_URL}${path}?per_page=100&page=${page}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 3600 },
        },
      );

      if (!response.ok) {
        break;
      }

      const payload = (await response.json()) as SlugListPayload;
      if (!Array.isArray(payload.data)) {
        break;
      }

      for (const row of payload.data) {
        if (typeof row.slug === "string" && row.slug.length > 0) {
          items.push({
            slug: row.slug,
            updatedAt: row.updated_at,
          });
        }
      }

      lastPage =
        typeof payload.meta?.last_page === "number" ? payload.meta.last_page : 1;
      page += 1;
    } while (page <= lastPage && page <= 20);
  } catch {
    // Keep static routes only — never invent URLs or fail the sitemap.
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Preview/dev: empty sitemap (robots already disallow all). Avoid listing
  // preview URLs or mixing preview hosts into the production sitemap.
  if (!shouldAllowSearchIndexing()) {
    return [];
  }

  const siteUrl = getSiteUrl();
  const [products, packs] = await Promise.all([
    fetchPublishedSlugs("/api/products"),
    fetchPublishedSlugs("/api/bundles"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${encodeURIComponent(product.slug)}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const packRoutes: MetadataRoute.Sitemap = packs.map((pack) => ({
    url: `${siteUrl}/packs/${encodeURIComponent(pack.slug)}`,
    lastModified: pack.updatedAt ? new Date(pack.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...productRoutes, ...packRoutes];
}
