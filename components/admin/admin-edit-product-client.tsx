"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { use, useMemo } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { useAdminProduct } from "@/hooks/use-products";

type AdminEditProductClientProps = {
  params: Promise<{ id: string }>;
};

export function AdminEditProductClient({ params }: AdminEditProductClientProps) {
  const { id } = use(params);
  const t = useTranslations("adminProducts");
  const searchParams = useSearchParams();
  const imagesFailed = searchParams.get("imagesFailed") === "1";
  const { data, isLoading, isError } = useAdminProduct(id);

  const notice = useMemo(() => {
    if (!imagesFailed) {
      return null;
    }

    return t("imagesFailedNotice");
  }, [imagesFailed, t]);

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
          {t("editTitle")}
        </h1>
        <p className="mt-3 text-muted">{t("formSubtitle")}</p>
        {notice ? <p className="mt-4 text-sm text-amber-200">{notice}</p> : null}
      </div>

      {isLoading ? <p className="text-sm text-muted">{t("loading")}</p> : null}
      {isError ? <p className="text-sm text-red-300">{t("unableToLoad")}</p> : null}
      {data?.data ? <ProductForm product={data.data} /> : null}
    </main>
  );
}
