"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  getAdminOrder,
  getCart,
  getMyOrder,
  listAdminOrders,
  listAdminShippingZones,
  listMyOrders,
  listShippingZones,
  placeCheckout,
  quoteCheckout,
  removeCartItem,
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

export function useCheckoutQuote(countryCode: CountryCode | null, enabled: boolean) {
  return useQuery({
    queryKey: ["checkout", "quote", countryCode],
    queryFn: async () => (await quoteCheckout(countryCode as CountryCode)).data,
    enabled: enabled && countryCode !== null,
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

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: async ({ signal }) => (await listMyOrders({ signal })).data,
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

export function useUpdateShippingProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShippingProfileInput) => updateShippingProfile(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(["auth", "user"], response.data);
    },
  });
}
