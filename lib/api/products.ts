import { apiRequest } from "@/lib/api/client";
import type {
  ProductInput,
  ProductListResponse,
  ProductResponse,
  ProductStatus,
} from "@/types/product";

type ListProductsParams = {
  status?: ProductStatus | "";
  search?: string;
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
};

export type ProductSort = "newest" | "price_asc" | "price_desc";

export type PublishedProductFilters = {
  search?: string;
  category?: string[];
  color?: string[];
  size?: string[];
  gender?: string[];
  sort?: ProductSort;
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
};

function setFacetParam(query: URLSearchParams, key: string, values?: string[]) {
  if (!values?.length) {
    return;
  }

  query.set(key, values.join(","));
}

export function listPublishedProducts(params: PublishedProductFilters = {}) {
  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  setFacetParam(query, "category", params.category);
  setFacetParam(query, "color", params.color);
  setFacetParam(query, "size", params.size);
  setFacetParam(query, "gender", params.gender);

  if (params.sort && params.sort !== "newest") {
    query.set("sort", params.sort);
  }

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  if (params.perPage) {
    query.set("per_page", String(params.perPage));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<ProductListResponse>(`/api/products${suffix}`, {
    signal: params.signal,
  });
}

export function getPublishedProduct(slug: string, init?: { signal?: AbortSignal }) {
  return apiRequest<ProductResponse>(`/api/products/${encodeURIComponent(slug)}`, {
    signal: init?.signal,
  });
}

export function listAdminProducts(params: ListProductsParams = {}) {
  const query = new URLSearchParams();

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  if (params.perPage) {
    query.set("per_page", String(params.perPage));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<ProductListResponse>(`/api/admin/products${suffix}`, {
    signal: params.signal,
  });
}

export function getAdminProduct(id: string, init?: { signal?: AbortSignal }) {
  return apiRequest<ProductResponse>(`/api/admin/products/${id}`, {
    signal: init?.signal,
  });
}

export function createAdminProduct(payload: ProductInput) {
  return apiRequest<ProductResponse>("/api/admin/products", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminProduct(id: string, payload: Partial<ProductInput>) {
  return apiRequest<ProductResponse>(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminProduct(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/products/${id}`, {
    method: "DELETE",
    body: {},
  });
}

export function uploadAdminProductImages(productId: string, files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images[]", file);
  });

  return apiRequest<ProductResponse>(`/api/admin/products/${productId}/images`, {
    method: "POST",
    body: formData,
    timeoutMs: 60_000,
  });
}

export function reorderAdminProductImages(productId: string, imageIds: string[]) {
  return apiRequest<ProductResponse>(`/api/admin/products/${productId}/images/order`, {
    method: "PATCH",
    body: { image_ids: imageIds },
  });
}

export function deleteAdminProductImage(productId: string, imageId: string) {
  return apiRequest<ProductResponse>(`/api/admin/products/${productId}/images/${imageId}`, {
    method: "DELETE",
    body: {},
  });
}
