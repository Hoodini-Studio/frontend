"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  useAdminOrders,
  useUpdateAdminOrderPaymentMutation,
  useUpdateAdminOrderStatusMutation,
} from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { CountryCode, OrderStatus, PaymentStatus } from "@/types/commerce";
import { TableSkeleton } from "@/components/ui/table-skeleton";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrdersList() {
  const t = useTranslations("adminOrders");
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [country, setCountry] = useState<CountryCode | "">("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const ordersQuery = useAdminOrders({
    status,
    country_code: country,
    search: query,
    page,
  });
  const updateStatus = useUpdateAdminOrderStatusMutation();
  const updatePayment = useUpdateAdminOrderPaymentMutation();

  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;
  const pending = updateStatus.isPending || updatePayment.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm text-muted" htmlFor="search">
            {t("search")}
          </label>
          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setQuery(search);
              }
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="status">
            {t("status")}
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as OrderStatus | "");
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none focus:border-white/30 sm:w-40"
          >
            <option value="">{t("statusAll")}</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`status_${value}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="country">
            {t("country")}
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => {
              setPage(1);
              setCountry(e.target.value as CountryCode | "");
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none focus:border-white/30 sm:w-32"
          >
            <option value="">{t("countryAll")}</option>
            <option value="XK">XK</option>
            <option value="AL">AL</option>
            <option value="MK">MK</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setQuery(search);
          }}
          className="rounded-xl border border-white/15 px-4 py-3 text-sm text-foreground transition hover:bg-white/5"
        >
          {t("apply")}
        </button>
      </div>

      {ordersQuery.isLoading ? <TableSkeleton rows={6} columns={6} /> : null}
      {ordersQuery.isError ? <p className="text-sm text-red-300">{t("unableToLoad")}</p> : null}

      {orders.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/3 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t("number")}</th>
                <th className="px-4 py-3 font-medium">{t("customer")}</th>
                <th className="px-4 py-3 font-medium">{t("total")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("payment")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="bg-black/20">
                  <td className="px-4 py-3 font-mono text-foreground">{order.number}</td>
                  <td className="px-4 py-3 text-foreground">
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted">
                      {order.country_code} · {order.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatEuroFromCents(order.total_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={pending}
                      onChange={(e) => {
                        void updateStatus
                          .mutateAsync({
                            id: order.id,
                            status: e.target.value as OrderStatus,
                          })
                          .then(() => toast(t("updatedToast")))
                          .catch(() => toast(t("unableToUpdate"), { variant: "error" }));
                      }}
                      className="rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-foreground"
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {t(`status_${value}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.payment_status}
                      disabled={pending}
                      onChange={(e) => {
                        void updatePayment
                          .mutateAsync({
                            id: order.id,
                            payment_status: e.target.value as PaymentStatus,
                          })
                          .then(() => toast(t("updatedToast")))
                          .catch(() => toast(t("unableToUpdate"), { variant: "error" }));
                      }}
                      className="rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-foreground"
                    >
                      <option value="unpaid">{t("payment_unpaid")}</option>
                      <option value="paid">{t("payment_paid")}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!ordersQuery.isLoading && orders.length === 0 ? (
        <p className="text-sm text-muted">{t("empty")}</p>
      ) : null}

      {meta && meta.last_page > 1 ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {t("previous")}
          </button>
          <button
            type="button"
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {t("next")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
