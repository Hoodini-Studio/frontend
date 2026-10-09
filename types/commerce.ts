export type CountryCode = "XK" | "AL" | "MK";

export type ShippingZone = {
  id: string;
  country_code: CountryCode;
  name_en: string;
  name_sq: string;
  delivery_fee_cents: number;
  free_shipping_min_qty: number | null;
  free_shipping_min_subtotal_cents: number | null;
  is_active: boolean;
};

export type ShippingZoneInput = {
  name_en?: string;
  name_sq?: string;
  delivery_fee_cents?: number;
  free_shipping_min_qty?: number | null;
  free_shipping_min_subtotal_cents?: number | null;
  is_active?: boolean;
};

export type CartItemSelection = {
  bundle_item_id: string;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  color: { id: string; name_en: string | null; name_sq: string | null; hex: string } | null;
  size: { id: string; name: string } | null;
};

export type CartItem = {
  id: string;
  type?: "product" | "bundle";
  quantity: number;
  product_id: string | null;
  bundle_id?: string | null;
  name: string;
  slug: string;
  unit_price_cents: number;
  line_total_cents: number;
  image_url: string | null;
  color: { id: string; name_en: string | null; name_sq: string | null; hex: string } | null;
  size: { id: string; name: string } | null;
  gender: { id: string; name_en: string | null; name_sq: string | null } | null;
  selections?: CartItemSelection[];
};

export type Cart = {
  id: string;
  items: CartItem[];
  item_count: number;
  subtotal_cents: number;
};

export type CheckoutQuote = {
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  item_count: number;
  country_code: CountryCode;
  coupon_code?: string | null;
};

export type CouponType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  min_subtotal_cents: number | null;
  max_uses: number | null;
  uses_count: number;
  max_uses_per_user: number | null;
  created_at: string;
  updated_at: string;
};

export type CouponInput = {
  code?: string;
  type?: CouponType;
  value?: number;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  min_subtotal_cents?: number | null;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "card";
export type PaymentStatus = "unpaid" | "paid";
/** Slug stored on the order (e.g. web, instagram, facebook). */
export type OrderSource = string;

export type OrderSourceOption = {
  id: string;
  slug: string;
  name: string;
};

export type OrderItem = {
  id: string;
  product_id: string | null;
  bundle_id?: string | null;
  bundle_name?: string | null;
  name: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  color_label: string | null;
  size_label: string | null;
  gender_label: string | null;
};

export type Order = {
  id: string;
  number: string;
  user_id: string | null;
  email: string | null;
  phone: string;
  customer_name: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  country_code: CountryCode;
  city: string;
  address_line: string;
  postal_code: string | null;
  notes: string | null;
  source?: OrderSource;
  source_label?: string | null;
  external_ref?: string | null;
  coupon_id?: string | null;
  coupon_code?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type ManualOrderLineInput =
  | {
      type: "product";
      product_id: string;
      quantity: number;
      color_label?: string | null;
      size_label?: string | null;
      gender_label?: string | null;
    }
  | {
      type: "pack";
      bundle_id: string;
      quantity: number;
    }
  | {
      type: "custom";
      name: string;
      unit_price_cents: number;
      quantity: number;
      color_label?: string | null;
      size_label?: string | null;
    };

export type ManualOrderInput = {
  customer_name: string;
  email?: string | null;
  phone: string;
  user_id?: string | null;
  country_code: CountryCode;
  city: string;
  address_line: string;
  postal_code?: string | null;
  notes?: string | null;
  source: OrderSource;
  external_ref?: string | null;
  shipping_cents?: number | null;
  items: ManualOrderLineInput[];
};

export type CheckoutInput = {
  customer_name: string;
  email?: string | null;
  phone: string;
  country_code: CountryCode;
  city: string;
  address_line: string;
  postal_code: string;
  notes?: string | null;
  payment_method: PaymentMethod;
  coupon_code?: string | null;
  terms_accepted?: boolean;
  idempotency_key?: string;
};

export type ShippingProfileInput = {
  phone?: string | null;
  shipping_country_code?: CountryCode | null;
  shipping_city?: string | null;
  shipping_address_line?: string | null;
  shipping_postal_code?: string | null;
};
