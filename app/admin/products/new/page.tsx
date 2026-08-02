import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New product",
};

export default async function AdminNewProductPage() {
  const t = await getTranslations("adminProducts");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-sm text-muted transition hover:text-foreground"
        >
          {t("backToProducts")}
        </Link>
        <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">
          {t("newTitle")}
        </h1>
        <p className="mt-3 text-muted">{t("formSubtitle")}</p>
      </div>

      <ProductForm />
    </main>
  );
}
