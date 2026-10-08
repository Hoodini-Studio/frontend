import type { Metadata } from "next";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { PackDetailPage } from "@/components/pack-detail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type PackPayload = {
  data?: {
    name?: string | null;
    description?: string | null;
    description_en?: string | null;
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

export default function PackPage({ params }: PageProps) {
  return (
    <StorefrontOnly>
      <PackDetailPage params={params} />
    </StorefrontOnly>
  );
}
