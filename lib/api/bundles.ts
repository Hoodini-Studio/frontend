import { apiRequest } from "@/lib/api/client";
import type {
  BundleInput,
  BundleListResponse,
  BundleResponse,
  BundleStatus,
} from "@/types/bundle";

type ListBundlesParams = {
  status?: BundleStatus | "";
  search?: string;
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
};

export type PublishedBundleFilters = {
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
};

export function listPublishedBundles(params: PublishedBundleFilters = {}) {
  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

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

  return apiRequest<BundleListResponse>(`/api/bundles${suffix}`, {
    signal: params.signal,
  });
}

export function getPublishedBundle(slug: string, init?: { signal?: AbortSignal }) {
  return apiRequest<BundleResponse>(`/api/bundles/${encodeURIComponent(slug)}`, {
    signal: init?.signal,
  });
}

export function listAdminBundles(params: ListBundlesParams = {}) {
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

  return apiRequest<BundleListResponse>(`/api/admin/bundles${suffix}`, {
    signal: params.signal,
  });
}

export function getAdminBundle(id: string, init?: { signal?: AbortSignal }) {
  return apiRequest<BundleResponse>(`/api/admin/bundles/${id}`, {
    signal: init?.signal,
  });
}

export function createAdminBundle(payload: BundleInput) {
  return apiRequest<BundleResponse>("/api/admin/bundles", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminBundle(id: string, payload: Partial<BundleInput>) {
  return apiRequest<BundleResponse>(`/api/admin/bundles/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminBundle(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/bundles/${id}`, {
    method: "DELETE",
    body: {},
  });
}
