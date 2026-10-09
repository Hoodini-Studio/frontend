import type { Bundle } from "@/types/bundle";
import type { User } from "@/types/user";
import type { Product } from "@/types/product";
import type { Cart, Coupon, Order, ShippingZone } from "@/types/commerce";

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const customerUser: User = {
  id: "user-customer-1",
  name: "Ada Customer",
  email: "ada@example.com",
  email_verified_at: "2026-01-01T00:00:00.000000Z",
  preferred_locale: "en",
  phone: "+38344111222",
  shipping_country_code: "XK",
  shipping_city: "Prishtina",
  shipping_address_line: "Rruga B 1",
  shipping_postal_code: "10000",
  marketing_new_drops: true,
  marketing_studio_updates: false,
  marketing_prefs_updated_at: null,
  terms_accepted_at: "2026-01-01T00:00:00.000000Z",
  avatar_url: null,
  roles: ["customer"],
  created_at: "2026-01-01T00:00:00.000000Z",
  updated_at: "2026-01-01T00:00:00.000000Z",
};

export const adminUser: User = {
  ...customerUser,
  id: "user-admin-1",
  name: "Admin Hoodini",
  email: "admin@example.com",
  roles: ["admin"],
};

export const categories = [
  {
    id: "cat-hoodies",
    name: "Hoodies",
    name_en: "Hoodies",
    name_sq: "Hoodie",
    slug: "hoodies",
    sort_order: 1,
    is_active: true,
    products_count: 2,
  },
];

export const collections = [
  {
    id: "col-anime",
    name: "Anime",
    name_en: "Anime",
    name_sq: "Anime",
    slug: "anime",
    sort_order: 1,
    is_active: true,
    products_count: 2,
  },
];

export const colors = [
  {
    id: "color-black",
    name: "Black",
    name_en: "Black",
    name_sq: "E zezë",
    slug: "black",
    hex: "#111111",
    sort_order: 1,
    is_active: true,
  },
];

export const sizes = [
  {
    id: "size-m",
    name: "M",
    name_en: "M",
    name_sq: "M",
    slug: "m",
    sort_order: 1,
    is_active: true,
  },
];

export const genders = [
  {
    id: "gender-unisex",
    name: "Unisex",
    name_en: "Unisex",
    name_sq: "Unisex",
    slug: "unisex",
    sort_order: 1,
    is_active: true,
  },
];

export const sampleProduct: Product = {
  id: "prod-1",
  name: "Studio Hoodie",
  slug: "studio-hoodie",
  description: "Soft studio hoodie.",
  description_en: "Soft studio hoodie.",
  description_sq: "Hoodie i butë studio.",
  price: 4500,
  status: "published",
  published_at: "2026-01-01T00:00:00.000000Z",
  images: [
    {
      id: "img-1",
      url: "/favicon.ico",
      sort_order: 0,
      is_primary: true,
      created_at: "2026-01-01T00:00:00.000000Z",
      updated_at: "2026-01-01T00:00:00.000000Z",
    },
  ],
  categories: [
    {
      id: "cat-hoodies",
      name: "Hoodies",
      name_en: "Hoodies",
      name_sq: "Hoodie",
      slug: "hoodies",
    },
  ],
  collections: [
    {
      id: "col-anime",
      name: "Anime",
      name_en: "Anime",
      name_sq: "Anime",
      slug: "anime",
    },
  ],
  colors: [
    {
      id: "color-black",
      name: "Black",
      name_en: "Black",
      name_sq: "E zezë",
      slug: "black",
      hex: "#111111",
    },
  ],
  sizes: [
    {
      id: "size-m",
      name: "M",
      name_en: "M",
      name_sq: "M",
      slug: "m",
    },
  ],
  genders: [
    {
      id: "gender-unisex",
      name: "Unisex",
      name_en: "Unisex",
      name_sq: "Unisex",
      slug: "unisex",
    },
  ],
  primary_image_url: "/favicon.ico",
  created_at: "2026-01-01T00:00:00.000000Z",
  updated_at: "2026-01-01T00:00:00.000000Z",
};

export const sampleProductB: Product = {
  ...sampleProduct,
  id: "prod-2",
  name: "Essential Tee",
  slug: "essential-tee",
  description: "Everyday tee.",
  description_en: "Everyday tee.",
  description_sq: "Bluzë e përditshme.",
  price: 2500,
  images: [
    {
      id: "img-2",
      url: "/favicon.ico",
      sort_order: 0,
      is_primary: true,
      created_at: "2026-01-01T00:00:00.000000Z",
      updated_at: "2026-01-01T00:00:00.000000Z",
    },
  ],
  primary_image_url: "/favicon.ico",
};

export const samplePack: Bundle = {
  id: "pack-1",
  name: "Studio Starter Pack",
  slug: "studio-starter-pack",
  description: "Hoodie + tee at a pack price.",
  description_en: "Hoodie + tee at a pack price.",
  description_sq: "Hoodie + bluzë me çmim pakete.",
  price: 6000,
  suggested_price_cents: 7000,
  status: "published",
  published_at: "2026-01-01T00:00:00.000000Z",
  item_count: 2,
  primary_image_url: sampleProduct.primary_image_url,
  items: [
    {
      id: "pack-item-1",
      product_id: sampleProduct.id,
      quantity: 1,
      sort_order: 0,
      product: {
        id: sampleProduct.id,
        name: sampleProduct.name,
        slug: sampleProduct.slug,
        price: sampleProduct.price,
        status: "published",
        primary_image_url: sampleProduct.primary_image_url,
        colors: sampleProduct.colors,
        sizes: sampleProduct.sizes,
      },
      colors: sampleProduct.colors ?? [],
      sizes: sampleProduct.sizes ?? [],
      color_ids: ["color-black"],
      size_ids: ["size-m"],
    },
    {
      id: "pack-item-2",
      product_id: sampleProductB.id,
      quantity: 1,
      sort_order: 1,
      product: {
        id: sampleProductB.id,
        name: sampleProductB.name,
        slug: sampleProductB.slug,
        price: sampleProductB.price,
        status: "published",
        primary_image_url: sampleProductB.primary_image_url,
        colors: sampleProductB.colors,
        sizes: sampleProductB.sizes,
      },
      colors: sampleProductB.colors ?? [],
      sizes: sampleProductB.sizes ?? [],
      color_ids: ["color-black"],
      size_ids: ["size-m"],
    },
  ],
  created_at: "2026-01-01T00:00:00.000000Z",
  updated_at: "2026-01-01T00:00:00.000000Z",
};

export const emptyCart: Cart = {
  id: "cart-1",
  items: [],
  item_count: 0,
  subtotal_cents: 0,
};

export const filledCart: Cart = {
  id: "cart-1",
  items: [
    {
      id: "cart-item-1",
      type: "product",
      quantity: 1,
      product_id: sampleProduct.id,
      bundle_id: null,
      name: sampleProduct.name,
      slug: sampleProduct.slug,
      unit_price_cents: sampleProduct.price,
      line_total_cents: sampleProduct.price,
      image_url: sampleProduct.primary_image_url,
      color: {
        id: "color-black",
        name_en: "Black",
        name_sq: "E zezë",
        hex: "#111111",
      },
      size: { id: "size-m", name: "M" },
      gender: {
        id: "gender-unisex",
        name_en: "Unisex",
        name_sq: "Unisex",
      },
      selections: [],
    },
  ],
  item_count: 1,
  subtotal_cents: sampleProduct.price,
};

export const packCart: Cart = {
  id: "cart-1",
  items: [
    {
      id: "cart-item-pack-1",
      type: "bundle",
      quantity: 1,
      product_id: null,
      bundle_id: samplePack.id,
      name: samplePack.name,
      slug: samplePack.slug,
      unit_price_cents: samplePack.price,
      line_total_cents: samplePack.price,
      image_url: samplePack.primary_image_url,
      color: null,
      size: null,
      gender: null,
      selections: [
        {
          bundle_item_id: "pack-item-1",
          product_id: sampleProduct.id,
          product_name: sampleProduct.name,
          quantity: 1,
          color: {
            id: "color-black",
            name_en: "Black",
            name_sq: "E zezë",
            hex: "#111111",
          },
          size: { id: "size-m", name: "M" },
        },
        {
          bundle_item_id: "pack-item-2",
          product_id: sampleProductB.id,
          product_name: sampleProductB.name,
          quantity: 1,
          color: {
            id: "color-black",
            name_en: "Black",
            name_sq: "E zezë",
            hex: "#111111",
          },
          size: { id: "size-m", name: "M" },
        },
      ],
    },
  ],
  item_count: 1,
  subtotal_cents: samplePack.price,
};

export const shippingZones: ShippingZone[] = [
  {
    id: "zone-xk",
    country_code: "XK",
    name_en: "Kosovo",
    name_sq: "Kosovë",
    delivery_fee_cents: 300,
    free_shipping_min_qty: null,
    free_shipping_min_subtotal_cents: 5000,
    is_active: true,
  },
  {
    id: "zone-al",
    country_code: "AL",
    name_en: "Albania",
    name_sq: "Shqipëri",
    delivery_fee_cents: 500,
    free_shipping_min_qty: null,
    free_shipping_min_subtotal_cents: null,
    is_active: true,
  },
];

export const sampleOrder: Order = {
  id: "order-1",
  number: "HS-1001",
  user_id: customerUser.id,
  email: customerUser.email,
  phone: customerUser.phone ?? "+38344111222",
  customer_name: customerUser.name,
  status: "pending",
  payment_method: "cash",
  payment_status: "unpaid",
  subtotal_cents: 4500,
  shipping_cents: 300,
  discount_cents: 0,
  total_cents: 4800,
  country_code: "XK",
  city: "Prishtina",
  address_line: "Rruga B 1",
  postal_code: "10000",
  notes: null,
  coupon_id: null,
  coupon_code: null,
  items: [
    {
      id: "order-item-1",
      product_id: sampleProduct.id,
      name: sampleProduct.name,
      unit_price_cents: sampleProduct.price,
      quantity: 1,
      line_total_cents: sampleProduct.price,
      color_label: "Black",
      size_label: "M",
      gender_label: "Unisex",
    },
  ],
  created_at: "2026-01-02T00:00:00.000000Z",
  updated_at: "2026-01-02T00:00:00.000000Z",
};

export const sampleCoupon: Coupon = {
  id: "coupon-1",
  code: "STUDIO10",
  type: "percent",
  value: 10,
  is_active: true,
  starts_at: null,
  ends_at: null,
  min_subtotal_cents: null,
  max_uses: null,
  uses_count: 0,
  max_uses_per_user: null,
  created_at: "2026-01-01T00:00:00.000000Z",
  updated_at: "2026-01-01T00:00:00.000000Z",
};

export function listMeta(total = 1) {
  return {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total,
  };
}
