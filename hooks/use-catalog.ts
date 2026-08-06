"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCategory,
  createAdminColor,
  createAdminGender,
  createAdminSize,
  deleteAdminCategory,
  deleteAdminColor,
  deleteAdminGender,
  deleteAdminSize,
  listAdminCategories,
  listAdminColors,
  listAdminGenders,
  listAdminSizes,
  listPublicCategories,
  listPublicColors,
  listPublicGenders,
  listPublicSizes,
  updateAdminCategory,
  updateAdminColor,
  updateAdminGender,
  updateAdminSize,
} from "@/lib/api/catalog";
import type {
  CategoryInput,
  ColorInput,
  GenderInput,
  SizeInput,
} from "@/types/catalog";

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: ({ signal }) => listAdminCategories({ signal }),
  });
}

export function useAdminColors() {
  return useQuery({
    queryKey: ["admin", "colors"],
    queryFn: ({ signal }) => listAdminColors({ signal }),
  });
}

export function useAdminSizes() {
  return useQuery({
    queryKey: ["admin", "sizes"],
    queryFn: ({ signal }) => listAdminSizes({ signal }),
  });
}

export function useAdminGenders() {
  return useQuery({
    queryKey: ["admin", "genders"],
    queryFn: ({ signal }) => listAdminGenders({ signal }),
  });
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: ({ signal }) => listPublicCategories({ signal }),
  });
}

export function usePublicColors() {
  return useQuery({
    queryKey: ["catalog", "colors"],
    queryFn: ({ signal }) => listPublicColors({ signal }),
  });
}

export function usePublicSizes() {
  return useQuery({
    queryKey: ["catalog", "sizes"],
    queryFn: ({ signal }) => listPublicSizes({ signal }),
  });
}

export function usePublicGenders() {
  return useQuery({
    queryKey: ["catalog", "genders"],
    queryFn: ({ signal }) => listPublicGenders({ signal }),
  });
}

function useInvalidateCatalog() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "colors"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "sizes"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "genders"] }),
      queryClient.invalidateQueries({ queryKey: ["catalog"] }),
    ]);
  };
}

export function useCreateCategoryMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (payload: CategoryInput) => createAdminCategory(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCategoryMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryInput> }) =>
      updateAdminCategory(id, payload),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteCategoryMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: () => invalidate(),
  });
}

export function useCreateColorMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (payload: ColorInput) => createAdminColor(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateColorMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ColorInput> }) =>
      updateAdminColor(id, payload),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteColorMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (id: string) => deleteAdminColor(id),
    onSuccess: () => invalidate(),
  });
}

export function useCreateSizeMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (payload: SizeInput) => createAdminSize(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateSizeMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SizeInput> }) =>
      updateAdminSize(id, payload),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteSizeMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (id: string) => deleteAdminSize(id),
    onSuccess: () => invalidate(),
  });
}

export function useCreateGenderMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (payload: GenderInput) => createAdminGender(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateGenderMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GenderInput> }) =>
      updateAdminGender(id, payload),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteGenderMutation() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: (id: string) => deleteAdminGender(id),
    onSuccess: () => invalidate(),
  });
}
