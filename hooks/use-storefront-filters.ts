"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductSort } from "@/lib/api/products";

export type StorefrontFilterState = {
  search: string;
  category: string[];
  color: string[];
  size: string[];
  gender: string[];
  priceMin: number | null;
  priceMax: number | null;
  sort: ProductSort;
};

type FacetKey = "category" | "color" | "size" | "gender";

const SORT_VALUES: ProductSort[] = ["newest", "price_asc", "price_desc"];

function parseList(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  );
}

function parseSort(value: string | null): ProductSort {
  if (value && SORT_VALUES.includes(value as ProductSort)) {
    return value as ProductSort;
  }

  return "newest";
}

function parseEuroToCents(value: string | null): number | null {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

function centsToEuroParam(cents: number): string {
  return (cents / 100).toString();
}

function toggleValue(values: string[], slug: string): string[] {
  return values.includes(slug)
    ? values.filter((value) => value !== slug)
    : [...values, slug];
}

function buildSearchParams(state: StorefrontFilterState): string {
  const params = new URLSearchParams();

  if (state.search.trim()) {
    params.set("q", state.search.trim());
  }
  if (state.category.length) {
    params.set("category", state.category.join(","));
  }
  if (state.color.length) {
    params.set("color", state.color.join(","));
  }
  if (state.size.length) {
    params.set("size", state.size.join(","));
  }
  if (state.gender.length) {
    params.set("gender", state.gender.join(","));
  }
  if (state.priceMin !== null) {
    params.set("price_min", centsToEuroParam(state.priceMin));
  }
  if (state.priceMax !== null) {
    params.set("price_max", centsToEuroParam(state.priceMax));
  }
  if (state.sort !== "newest") {
    params.set("sort", state.sort);
  }

  return params.toString();
}

export function useStorefrontFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<StorefrontFilterState>(
    () => ({
      search: searchParams.get("q")?.trim() ?? "",
      category: parseList(searchParams.get("category")),
      color: parseList(searchParams.get("color")),
      size: parseList(searchParams.get("size")),
      gender: parseList(searchParams.get("gender")),
      priceMin: parseEuroToCents(searchParams.get("price_min")),
      priceMax: parseEuroToCents(searchParams.get("price_max")),
      sort: parseSort(searchParams.get("sort")),
    }),
    [searchParams],
  );

  const replaceFilters = useCallback(
    (next: StorefrontFilterState) => {
      const query = buildSearchParams(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const toggleFacet = useCallback(
    (facet: FacetKey, slug: string) => {
      replaceFilters({
        ...filters,
        [facet]: toggleValue(filters[facet], slug),
      });
    },
    [filters, replaceFilters],
  );

  const removeFacet = useCallback(
    (facet: FacetKey, slug: string) => {
      replaceFilters({
        ...filters,
        [facet]: filters[facet].filter((value) => value !== slug),
      });
    },
    [filters, replaceFilters],
  );

  const setSort = useCallback(
    (sort: ProductSort) => {
      replaceFilters({ ...filters, sort });
    },
    [filters, replaceFilters],
  );

  const setSearch = useCallback(
    (search: string) => {
      replaceFilters({ ...filters, search });
    },
    [filters, replaceFilters],
  );

  const setPriceRange = useCallback(
    (priceMin: number | null, priceMax: number | null) => {
      replaceFilters({ ...filters, priceMin, priceMax });
    },
    [filters, replaceFilters],
  );

  const clearAll = useCallback(() => {
    replaceFilters({
      search: "",
      category: [],
      color: [],
      size: [],
      gender: [],
      priceMin: null,
      priceMax: null,
      sort: filters.sort,
    });
  }, [filters.sort, replaceFilters]);

  const activeCount =
    (filters.search ? 1 : 0) +
    filters.category.length +
    filters.color.length +
    filters.size.length +
    filters.gender.length +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0);

  return {
    filters,
    activeCount,
    toggleFacet,
    removeFacet,
    setSort,
    setSearch,
    setPriceRange,
    clearAll,
  };
}
