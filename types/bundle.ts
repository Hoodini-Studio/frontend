import type { ProductColorItem, ProductStatus, ProductTaxonomyItem } from "@/types/product";

export type BundleStatus = ProductStatus;

export type BundleItemProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: ProductStatus;
  primary_image_url: string | null;
  colors?: ProductColorItem[];
  sizes?: ProductTaxonomyItem[];
};

export type BundleItem = {
  id: string;
  product_id: string;
  quantity: number;
  sort_order: number;
  product: BundleItemProduct | null;
  colors: ProductColorItem[];
  sizes: ProductTaxonomyItem[];
  color_ids?: string[];
  size_ids?: string[];
};

export type Bundle = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_en: string | null;
  description_sq: string | null;
  price: number;
  suggested_price_cents: number | null;
  status: BundleStatus;
  published_at: string | null;
  items: BundleItem[];
  item_count?: number;
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type BundleResponse = {
  data: Bundle;
};

export type BundleListResponse = {
  data: Bundle[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type BundleItemInput = {
  product_id: string;
  quantity?: number;
  sort_order?: number;
  color_ids?: string[];
  size_ids?: string[];
};

export type BundleInput = {
  name: string;
  description_en?: string | null;
  description_sq?: string | null;
  price: number;
  status: BundleStatus;
  slug?: string | null;
  items?: BundleItemInput[];
};
