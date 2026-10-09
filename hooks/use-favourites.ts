"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavourite,
  getFavouriteIds,
  listFavourites,
  removeBundleFavourite,
  removeFavourite,
  type FavouriteIds,
} from "@/lib/api/favourites";

const emptyIds: FavouriteIds = { product_ids: [], bundle_ids: [] };

export function useFavouriteIds(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["favourites", "ids"],
    queryFn: async ({ signal }) => (await getFavouriteIds({ signal })).data,
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useFavouritesList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["favourites", "list"],
    queryFn: async ({ signal }) => (await listFavourites({ signal })).data,
    enabled: options?.enabled ?? true,
  });
}

export function useToggleFavouriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      bundleId,
      isFavourite,
    }: {
      productId?: string;
      bundleId?: string;
      isFavourite: boolean;
    }) => {
      if (bundleId) {
        if (isFavourite) {
          return removeBundleFavourite(bundleId);
        }
        return addFavourite({ bundleId });
      }

      if (!productId) {
        throw new Error("productId or bundleId is required");
      }

      if (isFavourite) {
        return removeFavourite(productId);
      }

      return addFavourite({ productId });
    },
    onSuccess: async (response) => {
      queryClient.setQueryData<FavouriteIds>(["favourites", "ids"], response.data);
      await queryClient.invalidateQueries({ queryKey: ["favourites", "list"] });
    },
  });
}

export function favouriteCount(ids: FavouriteIds | undefined): number {
  if (!ids) {
    return 0;
  }
  return ids.product_ids.length + ids.bundle_ids.length;
}

export function isProductFavourite(
  ids: FavouriteIds | undefined,
  productId: string,
): boolean {
  return (ids ?? emptyIds).product_ids.includes(productId);
}

export function isBundleFavourite(
  ids: FavouriteIds | undefined,
  bundleId: string,
): boolean {
  return (ids ?? emptyIds).bundle_ids.includes(bundleId);
}
