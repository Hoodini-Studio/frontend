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

export type CartItem = {
  id: string;
  quantity: number;
  product_id: string;
  name: string;
  slug: string;
  unit_price_cents: number;
  line_total_cents: number;
  image_url: string | null;
  color: { id: string; name_en: string | null; name_sq: string | null; hex: string } | null;
  size: { id: string; name: string } | null;
  gender: { id: string; name_en: string | null; name_sq: string | null } | null;
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
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "card";
export type PaymentStatus = "unpaid" | "paid";

export type OrderItem = {
  id: string;
  product_id: string | null;
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
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
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
};

export type ShippingProfileInput = {
  phone?: string | null;
  shipping_country_code?: CountryCode | null;
  shipping_city?: string | null;
  shipping_address_line?: string | null;
  shipping_postal_code?: string | null;
};
