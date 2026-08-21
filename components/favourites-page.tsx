"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FavouriteButton } from "@/components/favourite-button";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
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
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12 sm:py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">{t("favouritesEyebrow")}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {t("favouritesTitle")}
      </h1>
      <p className="mt-3 max-w-lg text-muted">{t("favouritesSubtitle")}</p>

      <div className="mt-10">
        {isLoading ? <ProductGridSkeleton /> : null}

        {isError ? (
          <p className="text-muted">{t("unableToLoadFavourites")}</p>
        ) : null}

        {!isLoading && !isError && products.length === 0 ? (
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t("favouritesEmptyTitle")}
            </h2>
            <p className="mt-3 text-muted">{t("favouritesEmptyMessage")}</p>
            <Link
              href="/"
              className="mt-6 inline-flex text-sm text-foreground underline-offset-4 hover:underline"
            >
              {t("backToShop")}
            </Link>
          </div>
        ) : null}

        {!isLoading && !isError && products.length > 0 ? (
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <li key={product.id} className="relative">
                <Link
                  href={`/products/${product.slug}`}
                  className="group block outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-linear-to-b from-white/7 to-white/2">
                    {product.primary_image_url ? (
                      <Image
                        src={product.primary_image_url}
                        alt={product.name ?? ""}
                        fill
                        unoptimized
                        priority={index < 3}
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-lg font-semibold text-foreground transition group-hover:opacity-80">
                      {product.name}
                    </h2>
                    <p className="shrink-0 text-sm text-muted">
                      {formatEuroFromCents(product.price)}
                    </p>
                  </div>
                  {(product.genders?.length || product.colors?.length) ? (
                    <p className="mt-2 text-xs text-muted">
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
                  className="absolute right-3 top-3 z-10 h-9 w-9"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
