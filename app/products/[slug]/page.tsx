import type { Metadata } from "next";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { ProductDetailPage } from "@/components/product-detail";

export const metadata: Metadata = {
  title: "Product",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function ProductPage({ params }: PageProps) {
  return (
    <StorefrontOnly>
      <ProductDetailPage params={params} />
    </StorefrontOnly>
  );
}
