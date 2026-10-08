"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";
import { PackForm } from "@/components/admin/pack-form";
import { useAdminBundle } from "@/hooks/use-bundles";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

type AdminEditPackClientProps = {
  params: Promise<{ id: string }>;
};

export function AdminEditPackClient({ params }: AdminEditPackClientProps) {
  const { id } = use(params);
  const t = useTranslations("adminPacks");
  const { data, isLoading, isError } = useAdminBundle(id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/packs"
          className="text-sm text-muted transition hover:text-foreground"
        >
          {t("backToPacks")}
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
          {t("editTitle")}
        </h1>
        <p className="mt-3 text-muted">{t("formSubtitle")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-5" aria-busy="true">
          <span className="sr-only">{t("loading")}</span>
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-40 rounded-xl" />
        </div>
      ) : null}
      {isError ? <p className="text-sm text-red-300">{t("unableToLoad")}</p> : null}
      {data?.data ? <PackForm key={data.data.updated_at} pack={data.data} /> : null}
    </main>
  );
}
