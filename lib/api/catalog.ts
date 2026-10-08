import { apiRequest } from "@/lib/api/client";
import type {
  CatalogCategory,
  CatalogCollection,
  CatalogColor,
  CatalogGender,
  CatalogSize,
  CategoryInput,
  CategoryListResponse,
  CollectionInput,
  CollectionListResponse,
  ColorInput,
  ColorListResponse,
  GenderInput,
  GenderListResponse,
  SizeInput,
  SizeListResponse,
} from "@/types/catalog";

export function listAdminCategories(init?: { signal?: AbortSignal }) {
  return apiRequest<CategoryListResponse>("/api/admin/categories", {
    signal: init?.signal,
  });
}

export function listPublicCategories(init?: { signal?: AbortSignal }) {
  return apiRequest<CategoryListResponse>("/api/categories", {
    signal: init?.signal,
  });
}

export function createAdminCategory(payload: CategoryInput) {
  return apiRequest<{ data: CatalogCategory }>("/api/admin/categories", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminCategory(id: string, payload: Partial<CategoryInput>) {
  return apiRequest<{ data: CatalogCategory }>(`/api/admin/categories/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminCategory(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/categories/${id}`, {
    method: "DELETE",
    body: {},
  });
}

export function reorderAdminCategories(ids: string[]) {
  return apiRequest<CategoryListResponse>("/api/admin/categories/reorder", {
    method: "PATCH",
    body: { ids },
  });
}

export function listAdminCollections(init?: { signal?: AbortSignal }) {
  return apiRequest<CollectionListResponse>("/api/admin/collections", {
    signal: init?.signal,
  });
}

export function listPublicCollections(init?: { signal?: AbortSignal }) {
  return apiRequest<CollectionListResponse>("/api/collections", {
    signal: init?.signal,
  });
}

export function createAdminCollection(payload: CollectionInput) {
  return apiRequest<{ data: CatalogCollection }>("/api/admin/collections", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminCollection(
  id: string,
  payload: Partial<CollectionInput>,
) {
  return apiRequest<{ data: CatalogCollection }>(`/api/admin/collections/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminCollection(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/collections/${id}`, {
    method: "DELETE",
    body: {},
  });
}

export function reorderAdminCollections(ids: string[]) {
  return apiRequest<CollectionListResponse>("/api/admin/collections/reorder", {
    method: "PATCH",
    body: { ids },
  });
}

export function listAdminColors(init?: { signal?: AbortSignal }) {
  return apiRequest<ColorListResponse>("/api/admin/colors", {
    signal: init?.signal,
  });
}

export function listPublicColors(init?: { signal?: AbortSignal }) {
  return apiRequest<ColorListResponse>("/api/colors", {
    signal: init?.signal,
  });
}

export function createAdminColor(payload: ColorInput) {
  return apiRequest<{ data: CatalogColor }>("/api/admin/colors", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminColor(id: string, payload: Partial<ColorInput>) {
  return apiRequest<{ data: CatalogColor }>(`/api/admin/colors/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminColor(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/colors/${id}`, {
    method: "DELETE",
    body: {},
  });
}

export function reorderAdminColors(ids: string[]) {
  return apiRequest<ColorListResponse>("/api/admin/colors/reorder", {
    method: "PATCH",
    body: { ids },
  });
}

export function listAdminSizes(init?: { signal?: AbortSignal }) {
  return apiRequest<SizeListResponse>("/api/admin/sizes", {
    signal: init?.signal,
  });
}

export function listPublicSizes(init?: { signal?: AbortSignal }) {
  return apiRequest<SizeListResponse>("/api/sizes", {
    signal: init?.signal,
  });
}

export function createAdminSize(payload: SizeInput) {
  return apiRequest<{ data: CatalogSize }>("/api/admin/sizes", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminSize(id: string, payload: Partial<SizeInput>) {
  return apiRequest<{ data: CatalogSize }>(`/api/admin/sizes/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminSize(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/sizes/${id}`, {
    method: "DELETE",
    body: {},
  });
}

export function reorderAdminSizes(ids: string[]) {
  return apiRequest<SizeListResponse>("/api/admin/sizes/reorder", {
    method: "PATCH",
    body: { ids },
  });
}

export function listAdminGenders(init?: { signal?: AbortSignal }) {
  return apiRequest<GenderListResponse>("/api/admin/genders", {
    signal: init?.signal,
  });
}

export function listPublicGenders(init?: { signal?: AbortSignal }) {
  return apiRequest<GenderListResponse>("/api/genders", {
    signal: init?.signal,
  });
}

export function createAdminGender(payload: GenderInput) {
  return apiRequest<{ data: CatalogGender }>("/api/admin/genders", {
    method: "POST",
    body: payload,
  });
}

export function updateAdminGender(id: string, payload: Partial<GenderInput>) {
  return apiRequest<{ data: CatalogGender }>(`/api/admin/genders/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAdminGender(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/genders/${id}`, {
    method: "DELETE",
    body: {},
  });
}

export function reorderAdminGenders(ids: string[]) {
  return apiRequest<GenderListResponse>("/api/admin/genders/reorder", {
    method: "PATCH",
    body: { ids },
  });
}
