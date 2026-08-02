import { apiRequest } from "@/lib/api/client";
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
