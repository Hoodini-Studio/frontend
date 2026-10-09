"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminUser,
  getAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserUpdateInput,
} from "@/lib/api/users";

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

export function useAdminUser(
  id: string | undefined,
  params?: { page?: number; perPage?: number },
) {
  return useQuery({
    queryKey: ["admin", "users", id, params],
    queryFn: ({ signal }) =>
      getAdminUser(id!, {
        page: params?.page,
        perPage: params?.perPage,
        signal,
      }),
    enabled: Boolean(id),
  });
}

export function useUpdateAdminUserMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUserUpdateInput) => updateAdminUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
