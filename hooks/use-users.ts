"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminUsers } from "@/lib/api/users";

export function useAdminUsers(filters: {
  search?: string;
  role?: string;
  page?: number;
  perPage?: number;
} = {}) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: ({ signal }) =>
      listAdminUsers({
        search: filters.search,
        role: filters.role,
        page: filters.page,
        perPage: filters.perPage,
        signal,
      }),
  });
}
