import type { Metadata } from "next";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { ProductDetailPage } from "@/components/product-detail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ProductPayload = {
  data?: {
    name?: string | null;
    description?: string | null;
    description_en?: string | null;
    primary_image_url?: string | null;
    images?: Array<{ url?: string | null }>;
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await fetch(
      `${API_URL}/api/products/${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return {
        title: "Product",
        robots: { index: false, follow: true },
      };
    }

    const payload = (await response.json()) as ProductPayload;
    const product = payload.data;
    const title = product?.name?.trim() || "Product";
    const description =
      product?.description?.trim() ||
      product?.description_en?.trim() ||
      `Shop ${title} at Hoodini Studio.`;
    const image =
      product?.primary_image_url || product?.images?.[0]?.url || undefined;

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
  } catch {
    return {
      title: "Product",
      robots: { index: false, follow: true },
    };
  }
}

export default function ProductPage({ params }: PageProps) {
  return (
    <StorefrontOnly>
      <ProductDetailPage params={params} />
    </StorefrontOnly>
  );
}
