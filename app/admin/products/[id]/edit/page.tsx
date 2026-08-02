import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminEditProductClient } from "@/components/admin/admin-edit-product-client";
import { LoadingLabel } from "@/components/i18n/loading-label";

export const metadata: Metadata = {
  title: "Edit product",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminEditProductPage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingLabel />}>
      <AdminEditProductClient params={params} />
    </Suspense>
  );
}
