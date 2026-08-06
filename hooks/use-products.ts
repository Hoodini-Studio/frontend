"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  createAdminProduct,
  deleteAdminProduct,
  deleteAdminProductImage,
  getAdminProduct,
  getPublishedProduct,
  listAdminProducts,
  listPublishedProducts,
  reorderAdminProductImages,
  updateAdminProduct,
  uploadAdminProductImages,
} from "@/lib/api/products";
import type { ProductInput, ProductStatus } from "@/types/product";
import type { ProductSort, PublishedProductFilters } from "@/lib/api/products";

export function usePublishedProducts(
  filters: Omit<PublishedProductFilters, "signal"> = {},
) {
  return useQuery({
    queryKey: ["products", "published", filters],
    queryFn: ({ signal }) =>
      listPublishedProducts({
        ...filters,
        signal,
      }),
    placeholderData: keepPreviousData,
  });
}

export type { ProductSort };

export function usePublishedProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["products", "published", slug],
    queryFn: ({ signal }) => getPublishedProduct(slug!, { signal }),
    enabled: Boolean(slug),
  });
}

export function useAdminProducts(filters: {
  status?: ProductStatus | "";
  search?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ["admin", "products", filters],
    queryFn: ({ signal }) =>
      listAdminProducts({
        status: filters.status,
        search: filters.search,
        page: filters.page,
        perPage: filters.perPage,
        signal,
      }),
  });
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "products", id],
    queryFn: ({ signal }) => getAdminProduct(id!, { signal }),
    enabled: Boolean(id),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductInput) => createAdminProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "published"] });
    },
  });
}

export function useUpdateProductMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ProductInput>) => updateAdminProduct(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "published"] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "published"] });
    },
  });
}

export function useUploadProductImagesMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => uploadAdminProductImages(productId, files),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "published"] });
    },
  });
}

export function useReorderProductImagesMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageIds: string[]) => reorderAdminProductImages(productId, imageIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "published"] });
    },
  });
}

export function useDeleteProductImageMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => deleteAdminProductImage(productId, imageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products", "published"] });
    },
  });
}
