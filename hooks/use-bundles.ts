"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminBundle,
  deleteAdminBundle,
  getAdminBundle,
  getPublishedBundle,
  listAdminBundles,
  listPublishedBundles,
  updateAdminBundle,
  type PublishedBundleFilters,
} from "@/lib/api/bundles";
import type { BundleInput, BundleStatus } from "@/types/bundle";

export function usePublishedBundles(
  filters: Omit<PublishedBundleFilters, "signal"> = {},
) {
  return useQuery({
    queryKey: ["bundles", "published", filters],
    queryFn: ({ signal }) =>
      listPublishedBundles({
        ...filters,
        signal,
      }),
    placeholderData: keepPreviousData,
  });
}

export function usePublishedBundle(slug: string | undefined) {
  return useQuery({
    queryKey: ["bundles", "published", slug],
    queryFn: ({ signal }) => getPublishedBundle(slug!, { signal }),
    enabled: Boolean(slug),
  });
}

export function useAdminBundles(filters: {
  status?: BundleStatus | "";
  search?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ["admin", "bundles", filters],
    queryFn: ({ signal }) =>
      listAdminBundles({
        status: filters.status,
        search: filters.search,
        page: filters.page,
        perPage: filters.perPage,
        signal,
      }),
  });
}

export function useAdminBundle(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "bundles", id],
    queryFn: ({ signal }) => getAdminBundle(id!, { signal }),
    enabled: Boolean(id),
  });
}

export function useCreateBundleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BundleInput) => createAdminBundle(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "bundles"] });
      await queryClient.invalidateQueries({ queryKey: ["bundles", "published"] });
    },
  });
}

export function useUpdateBundleMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<BundleInput>) => updateAdminBundle(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "bundles"] });
      await queryClient.invalidateQueries({ queryKey: ["bundles", "published"] });
    },
  });
}

export function useDeleteBundleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminBundle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "bundles"] });
      await queryClient.invalidateQueries({ queryKey: ["bundles", "published"] });
    },
  });
}
