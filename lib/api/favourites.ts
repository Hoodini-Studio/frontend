import { apiRequest } from "@/lib/api/client";
import type { Product } from "@/types/product";

export function getFavouriteIds(init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: string[]; meta: { count: number } }>(
    "/api/favourites/ids",
    { signal: init?.signal },
  );
}

export function listFavourites(init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: Product[]; meta: { count: number } }>(
    "/api/favourites",
    { signal: init?.signal },
  );
}

export function addFavourite(productId: string) {
  return apiRequest<{ data: string[]; meta: { count: number } }>(
    "/api/favourites",
    {
      method: "POST",
      body: { product_id: productId },
    },
  );
}

export function removeFavourite(productId: string) {
  return apiRequest<{ data: string[]; meta: { count: number } }>(
    `/api/favourites/${productId}`,
    {
      method: "DELETE",
      body: {},
    },
  );
}
