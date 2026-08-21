import { apiRequest } from "@/lib/api/client";
import type {
  Cart,
  CheckoutInput,
  CheckoutQuote,
  CountryCode,
  Order,
  OrderStatus,
  PaymentStatus,
  ShippingProfileInput,
  ShippingZone,
  ShippingZoneInput,
} from "@/types/commerce";
import type { AuthResponse } from "@/types/user";

export function getCart(init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: Cart }>("/api/cart", { signal: init?.signal });
}

export function addCartItem(payload: {
  product_id: string;
  quantity?: number;
  color_id?: string | null;
  size_id?: string | null;
}) {
  return apiRequest<{ data: Cart }>("/api/cart/items", {
    method: "POST",
    body: payload,
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiRequest<{ data: Cart }>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: { quantity },
  });
}

export function removeCartItem(itemId: string) {
  return apiRequest<{ data: Cart }>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    body: {},
  });
}

export function listShippingZones(init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: ShippingZone[] }>("/api/shipping/zones", {
    signal: init?.signal,
  });
}

export function listAdminShippingZones(init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: ShippingZone[] }>("/api/admin/shipping/zones", {
    signal: init?.signal,
  });
}

export function updateAdminShippingZone(id: string, payload: ShippingZoneInput) {
  return apiRequest<{ data: ShippingZone }>(`/api/admin/shipping/zones/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function quoteCheckout(country_code: CountryCode) {
  return apiRequest<{ data: CheckoutQuote }>("/api/checkout/quote", {
    method: "POST",
    body: { country_code },
  });
}

export function placeCheckout(payload: CheckoutInput) {
  return apiRequest<{ data: Order }>("/api/checkout", {
    method: "POST",
    body: payload,
  });
}

export function listMyOrders(params?: { signal?: AbortSignal }) {
  return apiRequest<{ data: Order[] }>("/api/orders", {
    signal: params?.signal,
  });
}

export function getMyOrder(id: string, init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: Order }>(`/api/orders/${id}`, {
    signal: init?.signal,
  });
}

export type AdminOrdersParams = {
  status?: OrderStatus | "";
  payment_status?: PaymentStatus | "";
  country_code?: CountryCode | "";
  search?: string;
  page?: number;
  per_page?: number;
  signal?: AbortSignal;
};

export function listAdminOrders(params: AdminOrdersParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.payment_status) query.set("payment_status", params.payment_status);
  if (params.country_code) query.set("country_code", params.country_code);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  const qs = query.toString();

  return apiRequest<{
    data: Order[];
    meta?: { current_page: number; last_page: number; total: number };
  }>(`/api/admin/orders${qs ? `?${qs}` : ""}`, {
    signal: params.signal,
  });
}

export function getAdminOrder(id: string, init?: { signal?: AbortSignal }) {
  return apiRequest<{ data: Order }>(`/api/admin/orders/${id}`, {
    signal: init?.signal,
  });
}

export function updateAdminOrderStatus(id: string, status: OrderStatus) {
  return apiRequest<{ data: Order }>(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function updateAdminOrderPaymentStatus(id: string, payment_status: PaymentStatus) {
  return apiRequest<{ data: Order }>(`/api/admin/orders/${id}/payment-status`, {
    method: "PATCH",
    body: { payment_status },
  });
}

export function updateShippingProfile(payload: ShippingProfileInput) {
  return apiRequest<AuthResponse>("/api/auth/shipping-profile", {
    method: "PATCH",
    body: payload,
  });
}
