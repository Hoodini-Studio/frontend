"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  createAdminCoupon,
  createAdminOrder,
  deleteAdminCoupon,
  getAdminOrder,
  getCart,
  getMyOrder,
  listAdminCoupons,
  listAdminOrderSources,
  listAdminOrders,
  listAdminShippingZones,
  listMyOrders,
  listShippingZones,
  placeCheckout,
  quoteCheckout,
  removeCartItem,
  updateAdminCoupon,
  updateAdminOrderPaymentStatus,
  updateAdminOrderStatus,
  updateAdminShippingZone,
  updateCartItem,
  updateShippingProfile,
  type AdminOrdersParams,
} from "@/lib/api/commerce";
import type {
  CheckoutInput,
  CountryCode,
  CouponInput,
  ManualOrderInput,
  OrderStatus,
  PaymentStatus,
  ShippingProfileInput,
  ShippingZoneInput,
} from "@/types/commerce";

export function useCart(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async ({ signal }) => (await getCart({ signal })).data,
    enabled: options?.enabled ?? true,
  });
}

export function useAddCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.data);
    },
  });
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.data);
    },
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.data);
    },
  });
}

export function useShippingZones() {
  return useQuery({
    queryKey: ["shipping", "zones"],
    queryFn: async ({ signal }) => (await listShippingZones({ signal })).data,
  });
}

export function useAdminShippingZones() {
  return useQuery({
    queryKey: ["admin", "shipping", "zones"],
    queryFn: async ({ signal }) => (await listAdminShippingZones({ signal })).data,
  });
}

export function useUpdateShippingZoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ShippingZoneInput }) =>
      updateAdminShippingZone(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "shipping"] });
      await queryClient.invalidateQueries({ queryKey: ["shipping"] });
    },
  });
}

export function useCheckoutQuote(
  countryCode: CountryCode | null,
  enabled: boolean,
  couponCode?: string | null,
) {
  const normalizedCoupon = couponCode?.trim() ? couponCode.trim() : null;

  return useQuery({
    queryKey: ["checkout", "quote", countryCode, normalizedCoupon],
    queryFn: async () =>
      (await quoteCheckout(countryCode as CountryCode, normalizedCoupon)).data,
    enabled: enabled && countryCode !== null,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async ({ signal }) => (await listAdminCoupons({ signal })).data,
  });
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CouponInput) => createAdminCoupon(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CouponInput }) =>
      updateAdminCoupon(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminCoupon(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function usePlaceCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutInput) => placeCheckout(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useMyOrders(params?: {
  page?: number;
  per_page?: number;
}) {
  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 10;

  return useQuery({
    queryKey: ["orders", "mine", { page, per_page: perPage }],
    queryFn: async ({ signal }) =>
      listMyOrders({
        page,
        per_page: perPage,
        signal,
      }),
  });
}

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: ["orders", "mine", id],
    queryFn: async ({ signal }) => (await getMyOrder(id, { signal })).data,
    enabled: Boolean(id),
  });
}

export function useAdminOrders(params: Omit<AdminOrdersParams, "signal">) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async ({ signal }) => listAdminOrders({ ...params, signal }),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: async ({ signal }) => (await getAdminOrder(id, { signal })).data,
    enabled: Boolean(id),
  });
}

export function useUpdateAdminOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateAdminOrderStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useUpdateAdminOrderPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payment_status }: { id: string; payment_status: PaymentStatus }) =>
      updateAdminOrderPaymentStatus(id, payment_status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useAdminOrderSources(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin", "order-sources"],
    queryFn: ({ signal }) => listAdminOrderSources({ signal }),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateAdminOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualOrderInput) => createAdminOrder(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "order-sources"] }),
      ]);
    },
  });
}

export function useUpdateShippingProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShippingProfileInput) => updateShippingProfile(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(["auth", "user"], response.data);
    },
  });
}
