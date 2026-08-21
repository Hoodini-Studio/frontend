"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { StorefrontFilterSheet } from "@/components/storefront-filter-sheet";
import { StorefrontFilters } from "@/components/storefront-filters";
import {
  usePublicCategories,
  usePublicColors,
  usePublicGenders,
  usePublicSizes,
} from "@/hooks/use-catalog";
import { usePublishedProducts, type ProductSort } from "@/hooks/use-products";
import { useStorefrontFilters } from "@/hooks/use-storefront-filters";
import { formatEuroFromCents } from "@/lib/money";
import { localizedName } from "@/lib/i18n/localized";
import { normalizeLocale } from "@/lib/i18n/config";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { FavouriteButton } from "@/components/favourite-button";
import { isAdmin } from "@/lib/auth/roles";
import { useCurrentUser } from "@/hooks/use-auth";

const HOME_PRODUCT_LIMIT = 48;
const EMPTY_CATEGORIES: never[] = [];
const EMPTY_COLORS: never[] = [];
const EMPTY_SIZES: never[] = [];
const EMPTY_GENDERS: never[] = [];

function StorefrontCatalogContent() {
  const t = useTranslations("store");
  const tCommon = useTranslations("common");
  const locale = normalizeLocale(useLocale());
  const { data: user } = useCurrentUser();
  const showFavourites = !isAdmin(user);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    filters,
    activeCount,
    toggleFacet,
    removeFacet,
    setSort,
    setSearch,
    setPriceRange,
    clearAll,
  } = useStorefrontFilters();

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [searchSyncedFrom, setSearchSyncedFrom] = useState(filters.search);

  if (filters.search !== searchSyncedFrom) {
    setSearchSyncedFrom(filters.search);
    setSearchDraft(filters.search);
  }

  useEffect(() => {
    const trimmed = searchDraft.trim();
    if (trimmed === filters.search) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSearch(searchDraft);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchDraft, filters.search, setSearch]);

  const categoriesQuery = usePublicCategories();
  const colorsQuery = usePublicColors();
  const sizesQuery = usePublicSizes();
  const gendersQuery = usePublicGenders();

  const categories = categoriesQuery.data?.data ?? EMPTY_CATEGORIES;
  const colors = colorsQuery.data?.data ?? EMPTY_COLORS;
  const sizes = sizesQuery.data?.data ?? EMPTY_SIZES;
  const genders = gendersQuery.data?.data ?? EMPTY_GENDERS;

  const { data, isLoading, isError, isFetching, isPlaceholderData } =
    usePublishedProducts({
      search: filters.search || undefined,
      category: filters.category,
      color: filters.color,
      size: filters.size,
      gender: filters.gender,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      sort: filters.sort,
      perPage: HOME_PRODUCT_LIMIT,
    });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? products.length;

  const activeChips = useMemo(() => {
    const chips: {
      key: string;
      label: string;
      onRemove: () => void;
    }[] = [];

    if (filters.search) {
      chips.push({
        key: `search-${filters.search}`,
        label: t("searchChip", { query: filters.search }),
        onRemove: () => setSearch(""),
      });
    }

    if (filters.priceMin !== null || filters.priceMax !== null) {
      const minLabel =
        filters.priceMin !== null ? formatEuroFromCents(filters.priceMin) : "…";
      const maxLabel =
        filters.priceMax !== null ? formatEuroFromCents(filters.priceMax) : "…";
      chips.push({
        key: "price",
        label: t("priceChip", { min: minLabel, max: maxLabel }),
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
        label: item?.name ?? slug,
        onRemove: () => removeFacet("size", slug),
      });
    }

    return chips;
  }, [
    filters,
    categories,
    colors,
    sizes,
    genders,
    locale,
    removeFacet,
    setPriceRange,
    setSearch,
    t,
  ]);

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12 sm:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">{t("eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {tCommon("brand")}
        </h1>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
        <label className="sr-only" htmlFor="storefront-search">
          {t("searchLabel")}
        </label>
        <input
          id="storefront-search"
          type="search"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-xs border border-white/20 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-white/40 sm:w-56"
        />

        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
          className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 text-sm text-foreground transition hover:border-white/40"
        >
          {filtersOpen ? t("closeFilters") : t("openFilters")}
          {activeCount > 0 ? (
            <span className="text-xs text-muted">({activeCount})</span>
          ) : null}
        </button>

        <div className="text-sm text-muted">
          {isLoading ? (
            <SkeletonBlock className="h-4 w-24" />
          ) : (
            t("resultsCount", { count: total })
          )}
        </div>

        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          <span className="sr-only sm:not-sr-only">{t("sortLabel")}</span>
          <select
            value={filters.sort}
            onChange={(event) => setSort(event.target.value as ProductSort)}
            className="appearance-none border-0 bg-transparent py-1 pr-6 text-foreground outline-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a3a3a3' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right center",
            }}
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="price_asc">{t("sortPriceAsc")}</option>
            <option value="price_desc">{t("sortPriceDesc")}</option>
          </select>
        </label>
      </div>

      {filtersOpen ? (
        <div className="mt-6 hidden border-b border-white/10 pb-8 lg:block animate-[fade-in-up_0.35s_ease-out]">
          <StorefrontFilters
            filters={filters}
            categories={categories}
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

      {activeChips.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 text-xs text-foreground transition hover:border-white/40 animate-[fade-in-up_0.3s_ease-out]"
              >
                <span>{chip.label}</span>
                <span aria-hidden className="text-muted">
                  ×
                </span>
                <span className="sr-only">
                  {t("removeFilter", { name: chip.label })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {isLoading ? <ProductGridSkeleton /> : null}

      {isError ? (
        <p className="mt-10 text-sm text-red-300">{t("unableToLoad")}</p>
      ) : null}

      {!isLoading && !isError && products.length === 0 ? (
        <div className="mt-10 max-w-md animate-[fade-in-up_0.4s_ease-out]">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {activeCount > 0 ? t("emptyFilteredTitle") : t("emptyTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {activeCount > 0 ? t("emptyFilteredMessage") : t("emptyMessage")}
          </p>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="mt-6 text-sm text-foreground underline decoration-white/30 underline-offset-4 transition hover:decoration-white/60"
            >
              {t("clearAll")}
            </button>
          ) : null}
        </div>
      ) : null}

      {!isError && products.length > 0 ? (
        <ul
          className={`mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
            isFetching && isPlaceholderData ? "opacity-80" : "opacity-100"
          }`}
        >
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
                  {(product.images?.length ?? 0) > 1 ? (
                    <span
                      aria-label={t("imageCount", { count: product.images.length })}
                      className="absolute bottom-3 right-3 bg-black/55 px-2 py-1 text-xs tabular-nums text-foreground backdrop-blur-sm"
                    >
                      {product.images.length}
                    </span>
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
              {showFavourites ? (
                <FavouriteButton
                  productId={product.id}
                  stopPropagation
                  className="absolute right-3 top-3 z-10 h-9 w-9"
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <StorefrontFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        categories={categories}
        colors={colors}
        sizes={sizes}
        genders={genders}
        onToggle={toggleFacet}
        onPriceChange={setPriceRange}
        onClear={clearAll}
        activeCount={activeCount}
        resultCount={total}
        mobileOnly
      />
    </div>
  );
}

export function StorefrontCatalog() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12">
          <ProductGridSkeleton />
        </div>
      }
    >
      <StorefrontCatalogContent />
    </Suspense>
  );
}
