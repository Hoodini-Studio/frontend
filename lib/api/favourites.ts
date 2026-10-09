import { apiRequest } from "@/lib/api/client";
import type { Bundle } from "@/types/bundle";
import type { Product } from "@/types/product";

export type FavouriteIds = {
  product_ids: string[];
  bundle_ids: string[];
};

export type FavouriteListItem =
  | { type: "product"; id: string; product: Product }
  | { type: "bundle"; id: string; bundle: Bundle };

export function getFavouriteIds(init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: FavouriteIds; meta: { count: number } }>(
    "/api/favourites/ids",
    { signal: init?.signal },
  );
}

export function listFavourites(init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: FavouriteListItem[]; meta: { count: number } }>(
    "/api/favourites",
    { signal: init?.signal },
  );
}

export function addFavourite(input: { productId?: string; bundleId?: string }) {
  const body = input.bundleId
    ? { bundle_id: input.bundleId }
    : { product_id: input.productId };

  return apiRequest<{ data: FavouriteIds; meta: { count: number } }>(
    "/api/favourites",
    {
      method: "POST",
      body,
    },
  );
}

export function removeFavourite(productId: string) {
  return apiRequest<{ data: FavouriteIds; meta: { count: number } }>(
    `/api/favourites/${productId}`,
    {
      method: "DELETE",
      body: {},
    },
  );
}

export function removeBundleFavourite(bundleId: string) {
  return apiRequest<{ data: FavouriteIds; meta: { count: number } }>(
    `/api/favourites/bundles/${bundleId}`,
    {
      method: "DELETE",
      body: {},
    },
  );
}
