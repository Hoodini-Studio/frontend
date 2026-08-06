"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductSort } from "@/lib/api/products";

export type StorefrontFilterState = {
  category: string[];
  color: string[];
  size: string[];
  gender: string[];
  sort: ProductSort;
};

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

function toggleValue(values: string[], slug: string): string[] {
  return values.includes(slug)
    ? values.filter((value) => value !== slug)
    : [...values, slug];
}

function buildSearchParams(state: StorefrontFilterState): string {
  const params = new URLSearchParams();

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
      category: parseList(searchParams.get("category")),
      color: parseList(searchParams.get("color")),
      size: parseList(searchParams.get("size")),
      gender: parseList(searchParams.get("gender")),
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
    (facet: keyof Omit<StorefrontFilterState, "sort">, slug: string) => {
      replaceFilters({
        ...filters,
        [facet]: toggleValue(filters[facet], slug),
      });
    },
    [filters, replaceFilters],
  );

  const removeFacet = useCallback(
    (facet: keyof Omit<StorefrontFilterState, "sort">, slug: string) => {
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

  const clearAll = useCallback(() => {
    replaceFilters({
      category: [],
      color: [],
      size: [],
      gender: [],
      sort: filters.sort,
    });
  }, [filters.sort, replaceFilters]);

  const activeCount =
    filters.category.length +
    filters.color.length +
    filters.size.length +
    filters.gender.length;

  return {
    filters,
    activeCount,
    toggleFacet,
    removeFacet,
    setSort,
    clearAll,
  };
}
