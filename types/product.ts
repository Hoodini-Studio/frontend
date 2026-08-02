export type ProductStatus = "draft" | "published";

export type ProductImage = {
  id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  published_at: string | null;
  images: ProductImage[];
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
  description?: string | null;
  price: number;
  status: ProductStatus;
  slug?: string | null;
};
