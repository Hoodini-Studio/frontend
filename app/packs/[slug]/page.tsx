import type { Metadata } from "next";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { PackDetailPage } from "@/components/pack-detail";
import { getSiteUrl } from "@/lib/site";
import { jsonLdScript, productJsonLd } from "@/lib/structured-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type PackPayload = {
  data?: {
    name?: string | null;
    description?: string | null;
    description_en?: string | null;
    price?: number | null;
    primary_image_url?: string | null;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await fetch(`${API_URL}/api/bundles/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return {
        title: "Pack",
        robots: { index: false, follow: true },
      };
    }

    const payload = (await response.json()) as PackPayload;
    const pack = payload.data;
    const title = pack?.name?.trim() || "Pack";
    const description =
      pack?.description?.trim() ||
      pack?.description_en?.trim() ||
      `Shop ${title} at Hoodini Studio.`;
    const image = pack?.primary_image_url || undefined;

    return {
      title,
      description,
      alternates: {
        canonical: `/packs/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `/packs/${slug}`,
        type: "website",
        ...(image ? { images: [{ url: image, alt: title }] } : {}),
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
      title: "Pack",
      robots: { index: false, follow: true },
    };
  }
}

export default async function PackPage({ params }: PageProps) {
  const { slug } = await params;
  let pack: PackPayload["data"] | null = null;

  try {
    const response = await fetch(
      `${API_URL}/api/bundles/${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      },
    );
    if (response.ok) {
      const payload = (await response.json()) as PackPayload;
      pack = payload.data ?? null;
    }
  } catch {
    pack = null;
  }

  const title = pack?.name?.trim() || "";
  const structured = title
    ? productJsonLd({
        name: title,
        description: pack?.description?.trim() || pack?.description_en?.trim(),
        url: `${getSiteUrl()}/packs/${slug}`,
        image: pack?.primary_image_url,
        priceCents: typeof pack?.price === "number" ? pack.price : null,
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
        <PackDetailPage params={params} />
      </StorefrontOnly>
    </>
  );
}
