"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavourite,
  getFavouriteIds,
  listFavourites,
  removeFavourite,
} from "@/lib/api/favourites";

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
      isFavourite,
    }: {
      productId: string;
      isFavourite: boolean;
    }) => {
      if (isFavourite) {
        return removeFavourite(productId);
      }

      return addFavourite(productId);
    },
    onSuccess: async (response) => {
      queryClient.setQueryData(["favourites", "ids"], response.data);
      await queryClient.invalidateQueries({ queryKey: ["favourites", "list"] });
    },
  });
}
