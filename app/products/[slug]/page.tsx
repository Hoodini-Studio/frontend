import type { Metadata } from "next";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { ProductDetailPage } from "@/components/product-detail";
import { getSiteUrl } from "@/lib/site";
import { jsonLdScript, productJsonLd } from "@/lib/structured-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type CatalogPayload = {
  data?: {
    name?: string | null;
    description?: string | null;
    description_en?: string | null;
    price?: number | null;
    primary_image_url?: string | null;
    images?: Array<{ url?: string | null }>;
  };
};

async function fetchCatalogItem(
  path: string,
): Promise<CatalogPayload["data"] | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as CatalogPayload;
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchCatalogItem(
    `/api/products/${encodeURIComponent(slug)}`,
  );

  if (!product) {
    return {
      title: "Product",
      robots: { index: false, follow: true },
    };
  }

  const title = product.name?.trim() || "Product";
  const description =
    product.description?.trim() ||
    product.description_en?.trim() ||
    `Shop ${title} at Hoodini Studio.`;
  const image =
    product.primary_image_url || product.images?.[0]?.url || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/products/${slug}`,
      type: "website",
      ...(image
        ? {
            images: [{ url: image, alt: title }],
          }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchCatalogItem(
    `/api/products/${encodeURIComponent(slug)}`,
  );
  const title = product?.name?.trim() || "";
  const structured = title
    ? productJsonLd({
        name: title,
        description:
          product?.description?.trim() || product?.description_en?.trim(),
        url: `${getSiteUrl()}/products/${slug}`,
        image: product?.primary_image_url || product?.images?.[0]?.url,
        priceCents: typeof product?.price === "number" ? product.price : null,
      })
    : null;

  return (
    <>
      {structured ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(structured) }}
        />
      ) : null}
      <StorefrontOnly>
        <ProductDetailPage params={params} />
      </StorefrontOnly>
    </>
  );
}
