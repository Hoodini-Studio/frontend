import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminEditPackClient } from "@/components/admin/admin-edit-pack-client";
import { LoadingLabel } from "@/components/i18n/loading-label";

export const metadata: Metadata = {
  title: "Edit pack",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminEditPackPage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingLabel />}>
      <AdminEditPackClient params={params} />
    </Suspense>
  );
}
