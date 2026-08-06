export type ProductStatus = "draft" | "published";

export type ProductImage = {
  id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductTaxonomyItem = {
  id: string;
  name: string;
  name_en?: string | null;
  name_sq?: string | null;
  slug: string;
};

export type ProductColorItem = ProductTaxonomyItem & {
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_en: string | null;
  description_sq: string | null;
  price: number;
  status: ProductStatus;
  published_at: string | null;
  images: ProductImage[];
  categories?: ProductTaxonomyItem[];
  colors?: ProductColorItem[];
  sizes?: ProductTaxonomyItem[];
  genders?: ProductTaxonomyItem[];
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductResponse = {
  data: Product;
};

export type ProductListResponse = {
  data: Product[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type ProductInput = {
  name: string;
  description_en?: string | null;
  description_sq?: string | null;
  price: number;
  status: ProductStatus;
  slug?: string | null;
  category_ids?: string[];
  color_ids?: string[];
  size_ids?: string[];
  gender_ids?: string[];
};
