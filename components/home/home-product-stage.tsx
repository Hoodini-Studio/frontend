"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FavouriteButton } from "@/components/favourite-button";
import { HomeDiscoveryRail } from "@/components/home/home-discovery-rail";
import { ProductQuickView } from "@/components/home/product-quick-view";
import { StorefrontFilterSheet } from "@/components/storefront-filter-sheet";
import { StorefrontFilters } from "@/components/storefront-filters";
import { Select } from "@/components/ui/select";
import { Reveal } from "@/components/ui/reveal";
import { useHomeLayer } from "@/hooks/use-home-layer";
import { useHomepageCopy } from "@/hooks/use-homepage-copy";
import {
  usePublicCategories,
  usePublicCollections,
  usePublicColors,
  usePublicGenders,
  usePublicSizes,
} from "@/hooks/use-catalog";
import { usePublishedProductsInfinite, type ProductSort } from "@/hooks/use-products";
import { useStorefrontFilters } from "@/hooks/use-storefront-filters";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAdmin } from "@/lib/auth/roles";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";
import { formatEuroFromCents } from "@/lib/money";
import { pageShellClass } from "@/lib/layout";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import type { Product } from "@/types/product";

const PAGE_SIZE = 12;
const EMPTY_CATALOG: never[] = [];

function ProductTile({
  product,
  locale,
  showFavourites,
  onQuickView,
  quickViewLabel,
}: {
  product: Product;
  locale: ReturnType<typeof normalizeLocale>;
  showFavourites: boolean;
  onQuickView: (product: Product) => void;
  quickViewLabel: string;
}) {
  const subtitle = [
    ...(product.collections ?? []).slice(0, 1).map((item) => localizedName(item, locale)),
    ...(product.colors ?? []).slice(0, 2).map((item) => localizedName(item, locale)),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-4/5 overflow-hidden bg-surface">
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : null}
        {showFavourites ? (
          <div className="absolute right-3 top-3 z-10">
            <FavouriteButton productId={product.id} />
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="absolute inset-x-4 bottom-4 z-10 bg-foreground/95 px-4 py-3 text-center text-sm font-medium text-background opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
        >
          {quickViewLabel}
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/products/${product.slug}`}
            className="font-display text-lg font-bold tracking-tight text-foreground transition hover:opacity-80"
          >
            {product.name}
          </Link>
          {subtitle ? (
            <p className="mt-1 truncate text-xs text-muted">{subtitle}</p>
          ) : null}
        </div>
        <p className="shrink-0 text-sm text-foreground">
          {formatEuroFromCents(product.price)}
        </p>
      </div>
    </article>
  );
}

function ProductStageContent() {
  const t = useTranslations("home");
  const tStore = useTranslations("store");
  const copy = useHomepageCopy();
  const [layerRef, layer] = useHomeLayer({ z: 3, pin: "never" });
  const locale = normalizeLocale(useLocale());
  const { data: user } = useCurrentUser();
  const showFavourites = !isAdmin(user);
  const {
    filters,
    activeCount,
    toggleFacet,
    removeFacet,
    setSort,
    setPriceRange,
    clearAll,
  } = useStorefrontFilters();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const categoriesQuery = usePublicCategories();
  const collectionsQuery = usePublicCollections();
  const colorsQuery = usePublicColors();
  const sizesQuery = usePublicSizes();
  const gendersQuery = usePublicGenders();

  const categories = categoriesQuery.data?.data ?? EMPTY_CATALOG;
  const collections = collectionsQuery.data?.data ?? EMPTY_CATALOG;
  const colors = colorsQuery.data?.data ?? EMPTY_CATALOG;
  const sizes = sizesQuery.data?.data ?? EMPTY_CATALOG;
  const genders = gendersQuery.data?.data ?? EMPTY_CATALOG;

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = usePublishedProductsInfinite({
    search: filters.search || undefined,
    category: filters.category,
    collection: filters.collection,
    color: filters.color,
    size: filters.size,
    gender: filters.gender,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    sort: filters.sort,
    perPage: PAGE_SIZE,
  });

  const products = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta?.total;
  const isFilterRefreshing =
    isFetching && isPlaceholderData && !isFetchingNextPage && products.length > 0;

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.priceMin !== null || filters.priceMax !== null) {
      const minLabel =
        filters.priceMin !== null ? formatEuroFromCents(filters.priceMin) : "…";
      const maxLabel =
        filters.priceMax !== null ? formatEuroFromCents(filters.priceMax) : "…";
      chips.push({
        key: "price",
        label: tStore("priceChip", { min: minLabel, max: maxLabel }),
        onRemove: () => setPriceRange(null, null),
      });
    }

    for (const slug of filters.category) {
      const item = categories.find((entry) => entry.slug === slug);
      chips.push({
        key: `category-${slug}`,
        label: item ? localizedName(item, locale) : slug,
        onRemove: () => removeFacet("category", slug),
      });
    }

    for (const slug of filters.collection) {
      const item = collections.find((entry) => entry.slug === slug);
      chips.push({
        key: `collection-${slug}`,
        label: item ? localizedName(item, locale) : slug,
        onRemove: () => removeFacet("collection", slug),
      });
    }

    for (const slug of filters.gender) {
      const item = genders.find((entry) => entry.slug === slug);
      chips.push({
        key: `gender-${slug}`,
        label: item ? localizedName(item, locale) : slug,
        onRemove: () => removeFacet("gender", slug),
      });
    }

    for (const slug of filters.color) {
      const item = colors.find((entry) => entry.slug === slug);
      chips.push({
        key: `color-${slug}`,
        label: item ? localizedName(item, locale) : slug,
        onRemove: () => removeFacet("color", slug),
      });
    }

    for (const slug of filters.size) {
      const item = sizes.find((entry) => entry.slug === slug);
      chips.push({
        key: `size-${slug}`,
        label: item ? localizedName(item, locale) : slug,
        onRemove: () => removeFacet("size", slug),
      });
    }

    return chips;
  }, [
    filters,
    categories,
    collections,
    colors,
    sizes,
    genders,
    locale,
    removeFacet,
    setPriceRange,
    tStore,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, products.length]);

  return (
    <section
      id="the-drop"
      ref={layerRef}
      data-stack={layer["data-stack"]}
      style={layer.style}
      aria-labelledby="the-drop-heading"
      className={`${layer.className} anchor-scroll border-b border-border`}
    >
      <HomeDiscoveryRail />
      <div className={pageShellClass("shell", "py-14 sm:py-16")}>
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="the-drop-heading"
                className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              >
                {copy.dropTitle}
              </h2>
              <p className="mt-2 text-sm text-muted">{copy.dropSubtitle}</p>
            </div>
            {total != null ? (
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {tStore("resultsCount", { count: total })}
              </p>
            ) : null}
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-4">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-foreground transition hover:border-border-strong hover:bg-surface"
          >
            {tStore("openFilters")}
            {activeCount > 0 ? (
              <span className="ml-2 text-muted">({activeCount})</span>
            ) : null}
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            <span className="sr-only sm:not-sr-only">{tStore("sortLabel")}</span>
            <Select
              value={filters.sort}
              onChange={(next) => setSort(next as ProductSort)}
              variant="ghost"
              aria-label={tStore("sortLabel")}
              options={[
                { value: "newest", label: tStore("sortNewest") },
                { value: "price_asc", label: tStore("sortPriceAsc") },
                { value: "price_desc", label: tStore("sortPriceDesc") },
              ]}
            />
          </label>
        </div>

        {filtersOpen ? (
          <div className="mt-6 hidden border-b border-border pb-8 lg:block">
            <StorefrontFilters
              filters={filters}
              categories={categories}
              collections={collections}
              colors={colors}
              sizes={sizes}
              genders={genders}
              onToggle={toggleFacet}
              onPriceChange={setPriceRange}
              onClear={clearAll}
              activeCount={activeCount}
              showHeader={false}
              className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4"
            />
          </div>
        ) : null}

        <StorefrontFilterSheet
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          categories={categories}
          collections={collections}
          colors={colors}
          sizes={sizes}
          genders={genders}
          onToggle={toggleFacet}
          onPriceChange={setPriceRange}
          onClear={clearAll}
          activeCount={activeCount}
          resultCount={total ?? products.length}
          mobileOnly
        />

        {activeChips.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-xs text-foreground transition hover:border-border-strong"
                >
                  <span>{chip.label}</span>
                  <span aria-hidden className="text-muted">
                    ×
                  </span>
                  <span className="sr-only">
                    {tStore("removeFilter", { name: chip.label })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {isLoading && products.length === 0 ? (
          <div className="mt-10">
            <ProductGridSkeleton count={3} />
          </div>
        ) : null}

        {isError && products.length === 0 ? (
          <div className="mt-10 space-y-4">
            <p className="text-sm text-red-300">{tStore("unableToLoad")}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-foreground transition hover:border-border-strong"
            >
              {t("retryLoad")}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && !isPlaceholderData && products.length === 0 ? (
          <div className="mt-10 max-w-md">
            <p className="font-display text-xl font-bold text-foreground">
              {tStore("emptyFilteredTitle")}
            </p>
            <p className="mt-2 text-sm text-muted">{tStore("emptyFilteredMessage")}</p>
          </div>
        ) : null}

        {products.length > 0 ? (
          <>
            <ul
              className={[
                "mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
                "transition-opacity duration-300 ease-out",
                isFilterRefreshing ? "opacity-45" : "opacity-100",
              ].join(" ")}
            >
              {products.map((product, index) => (
                <li key={product.id}>
                  <Reveal delayMs={Math.min(index, 5) * 60}>
                    <ProductTile
                      product={product}
                      locale={locale}
                      showFavourites={showFavourites}
                      onQuickView={setQuickView}
                      quickViewLabel={t("quickView")}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} className="h-8" aria-hidden />

            {isFetchingNextPage ? (
              <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted">
                {t("loadingMore")}
              </p>
            ) : null}

            {isError && products.length > 0 ? (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => void fetchNextPage()}
                  className="border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-foreground transition hover:border-border-strong"
                >
                  {t("retryLoad")}
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <ProductQuickView
        product={quickView}
        open={Boolean(quickView)}
        onClose={() => setQuickView(null)}
      />
    </section>
  );
}

export function HomeProductStage() {
  return (
    <Suspense
      fallback={
        <div className={pageShellClass("shell", "py-16")}>
          <ProductGridSkeleton count={3} />
        </div>
      }
    >
      <ProductStageContent />
    </Suspense>
  );
}
