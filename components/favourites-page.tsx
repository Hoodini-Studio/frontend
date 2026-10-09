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
  const tHome = useTranslations("home");
  const locale = normalizeLocale(useLocale());
  const { data, isLoading, isError } = useFavouritesList();
  const items = data ?? [];

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

      {!isLoading && !isError && items.length === 0 ? (
        <div className="mt-10 space-y-4">
          <p className="text-muted">{t("favouritesEmptyTitle")}</p>
          <p className="text-sm text-muted">{t("favouritesEmptyMessage")}</p>
          <Link
            href="/#the-drop"
            className="inline-flex text-sm text-foreground underline-offset-4 hover:underline"
          >
            {t("backToShop")}
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {items.map((entry, index) => {
            if (entry.type === "bundle") {
              const pack = entry.bundle;
              const itemCount = pack.item_count ?? pack.items?.length ?? 0;

              return (
                <li key={`bundle-${pack.id}`} className="relative">
                  <Link
                    href={`/packs/${pack.slug}`}
                    className="group block outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                  >
                    <div className="relative aspect-4/5 overflow-hidden bg-surface">
                      {pack.primary_image_url ? (
                        <Image
                          src={pack.primary_image_url}
                          alt={pack.name ?? ""}
                          fill
                          unoptimized
                          loading={index < 3 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      ) : null}
                      <span className="absolute left-3 top-3 border border-foreground/50 bg-background/50 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
                        {tHome("packBadge")}
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-4">
                      <h2 className="font-medium text-foreground transition group-hover:opacity-80">
                        {pack.name}
                      </h2>
                      <p className="shrink-0 text-sm text-muted">
                        {formatEuroFromCents(pack.price)}
                      </p>
                    </div>
                    {itemCount > 0 ? (
                      <p className="mt-1 text-xs text-muted">
                        {t("packItemCount", { count: itemCount })}
                      </p>
                    ) : null}
                  </Link>
                  <FavouriteButton
                    bundleId={pack.id}
                    stopPropagation
                    className="absolute right-3 top-3 z-10"
                  />
                </li>
              );
            }

            const product = entry.product;

            return (
              <li key={`product-${product.id}`} className="relative">
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
                  {product.genders?.length || product.colors?.length ? (
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
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
