import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CatalogManager } from "@/components/admin/catalog-manager";

export const metadata: Metadata = {
  title: "Catalog",
};

export default async function AdminCatalogPage() {
  const t = await getTranslations("adminCatalog");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <span aria-hidden="true">←</span>
        {t("backToDashboard")}
      </Link>

      <div className="mt-8 mb-8">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{t("subtitle")}</p>
      </div>

      <CatalogManager />
    </main>
  );
}
