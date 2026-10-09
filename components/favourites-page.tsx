"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FavouriteButton } from "@/components/favourite-button";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { pageShellClass } from "@/lib/layout";
import { useFavouritesList } from "@/hooks/use-favourites";
import { formatEuroFromCents } from "@/lib/money";
import { localizedName } from "@/lib/i18n/localized";
import { normalizeLocale } from "@/lib/i18n/config";

export function FavouritesPageContent() {
  const t = useTranslations("store");
  const locale = normalizeLocale(useLocale());
  const { data, isLoading, isError } = useFavouritesList();
  const products = data ?? [];

  return (
    <div className={pageShellClass("content", "py-12 sm:py-16")}>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t("favouritesTitle")}
      </h1>

      {isLoading ? (
        <div className="mt-10">
          <ProductGridSkeleton className="mt-0" />
        </div>
      ) : null}

      {isError ? (
        <p className="mt-8 text-sm text-red-300">{t("unableToLoadFavourites")}</p>
      ) : null}

      {!isLoading && !isError && products.length === 0 ? (
        <div className="mt-10 space-y-4">
          <p className="text-muted">{t("favouritesEmptyTitle")}</p>
          <Link
            href="/#the-drop"
            className="inline-flex text-sm text-foreground underline-offset-4 hover:underline"
          >
            {t("backToShop")}
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && products.length > 0 ? (
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {products.map((product, index) => (
            <li key={product.id} className="relative">
              <Link
                href={`/products/${product.slug}`}
                className="group block outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-surface">
                  {product.primary_image_url ? (
                    <Image
                      src={product.primary_image_url}
                      alt={product.name ?? ""}
                      fill
                      unoptimized
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-medium text-foreground transition group-hover:opacity-80">
                    {product.name}
                  </h2>
                  <p className="shrink-0 text-sm text-muted">
                    {formatEuroFromCents(product.price)}
                  </p>
                </div>
                {(product.genders?.length || product.colors?.length) ? (
                  <p className="mt-1 text-xs text-muted">
                    {[
                      ...(product.genders ?? []).map((item) =>
                        localizedName(item, locale),
                      ),
                      ...(product.colors ?? []).map((item) =>
                        localizedName(item, locale),
                      ),
                    ].join(" · ")}
                  </p>
                ) : null}
              </Link>
              <FavouriteButton
                productId={product.id}
                stopPropagation
                className="absolute right-3 top-3 z-10"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
