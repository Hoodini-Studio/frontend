export type CatalogCategory = {
  id: string;
  name: string;
  name_en: string | null;
  name_sq: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  description_sq: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogColor = {
  id: string;
  name: string;
  name_en: string | null;
  name_sq: string | null;
  slug: string;
  hex: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogSize = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogGender = {
  id: string;
  name: string;
  name_en: string | null;
  name_sq: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryListResponse = { data: CatalogCategory[] };
export type ColorListResponse = { data: CatalogColor[] };
export type SizeListResponse = { data: CatalogSize[] };
export type GenderListResponse = { data: CatalogGender[] };

export type CategoryInput = {
  name_en?: string | null;
  name_sq?: string | null;
  slug?: string | null;
  description_en?: string | null;
  description_sq?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type ColorInput = {
  name_en?: string | null;
  name_sq?: string | null;
  slug?: string | null;
  hex: string;
  sort_order?: number;
  is_active?: boolean;
};

export type SizeInput = {
  name: string;
  slug?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type GenderInput = {
  name_en?: string | null;
  name_sq?: string | null;
  slug?: string | null;
  sort_order?: number;
  is_active?: boolean;
};
