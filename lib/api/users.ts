import { apiRequest } from "@/lib/api/client";
import type { Order } from "@/types/commerce";
import type { User } from "@/types/user";

export type UserListResponse = {
  data: User[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type UserDetailResponse = {
  data: User;
  orders?: {
    data: Order[];
    meta?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
};

export type AdminUserUpdateInput = {
  name?: string;
  phone?: string | null;
  preferred_locale?: string | null;
  shipping_country_code?: string | null;
  shipping_city?: string | null;
  shipping_address_line?: string | null;
  shipping_postal_code?: string | null;
  marketing_new_drops?: boolean;
  marketing_studio_updates?: boolean;
  role?: "admin" | "customer";
};

type ListAdminUsersParams = {
  search?: string;
  role?: string;
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
};

export function listAdminUsers(params: ListAdminUsersParams = {}) {
  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.role) {
    query.set("role", params.role);
  }

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  if (params.perPage) {
    query.set("per_page", String(params.perPage));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<UserListResponse>(`/api/admin/users${suffix}`, {
    signal: params.signal,
  });
}

export function getAdminUser(
  id: string,
  params?: { page?: number; perPage?: number; signal?: AbortSignal },
) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.perPage) query.set("per_page", String(params.perPage));
  const qs = query.toString();

  return apiRequest<UserDetailResponse>(
    `/api/admin/users/${id}${qs ? `?${qs}` : ""}`,
    { signal: params?.signal },
  );
}

export function updateAdminUser(id: string, payload: AdminUserUpdateInput) {
  return apiRequest<{ data: User }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminUser(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/users/${id}`, {
    method: "DELETE",
    body: {},
  });
}
