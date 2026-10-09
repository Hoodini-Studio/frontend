"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  useAdminOrderSources,
  useAdminOrders,
  useUpdateAdminOrderPaymentMutation,
  useUpdateAdminOrderStatusMutation,
} from "@/hooks/use-commerce";
import { downloadAdminOrdersCsv } from "@/lib/api/commerce";
import { formatEuroFromCents } from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { CountryCode, OrderStatus, PaymentStatus } from "@/types/commerce";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Select } from "@/components/ui/select";

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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [country, setCountry] = useState<CountryCode | "">("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const sourcesQuery = useAdminOrderSources();
  const sourceOptions = sourcesQuery.data?.data ?? [];

  const filters = {
    status,
    payment_status: paymentStatus,
    country_code: country,
    source,
    search: query,
    date_from: dateFrom,
    date_to: dateTo,
    page,
  };

  const ordersQuery = useAdminOrders(filters);
  const updateStatus = useUpdateAdminOrderStatusMutation();
  const updatePayment = useUpdateAdminOrderPaymentMutation();

  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;
  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? orders.length;
  const pending = updateStatus.isPending || updatePayment.isPending;

  const applyFilters = () => {
    setPage(1);
    setQuery(search);
  };

  const onDownload = async () => {
    setDownloading(true);
    try {
      await downloadAdminOrdersCsv({
        status,
        payment_status: paymentStatus,
        country_code: country,
        source,
        search: query,
        date_from: dateFrom,
        date_to: dateTo,
      });
    } catch {
      toast(t("downloadFailed"), { variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/orders/new"
          className="bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          {t("newOrder")}
        </Link>
        <button
          type="button"
          disabled={downloading || ordersQuery.isLoading}
          onClick={() => void onDownload()}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5 disabled:opacity-50"
        >
          {downloading ? t("downloading") : t("downloadCsv")}
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-[12rem] flex-1">
          <label className="mb-2 block text-sm text-muted" htmlFor="search">
            {t("search")}
          </label>
          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="status">
            {t("status")}
          </label>
          <Select
            id="status"
            value={status}
            onChange={(next) => {
              setPage(1);
              setStatus(next as OrderStatus | "");
            }}
            className="sm:w-40"
            options={[
              { value: "", label: t("statusAll") },
              ...STATUSES.map((value) => ({
                value,
                label: t(`status_${value}`),
              })),
            ]}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="payment">
            {t("payment")}
          </label>
          <Select
            id="payment"
            value={paymentStatus}
            onChange={(next) => {
              setPage(1);
              setPaymentStatus(next as PaymentStatus | "");
            }}
            className="sm:w-36"
            options={[
              { value: "", label: t("paymentAll") },
              { value: "unpaid", label: t("payment_unpaid") },
              { value: "paid", label: t("payment_paid") },
            ]}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="country">
            {t("country")}
          </label>
          <Select
            id="country"
            value={country}
            onChange={(next) => {
              setPage(1);
              setCountry(next as CountryCode | "");
            }}
            className="sm:w-32"
            options={[
              { value: "", label: t("countryAll") },
              { value: "XK", label: "XK" },
              { value: "AL", label: "AL" },
              { value: "MK", label: "MK" },
            ]}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="source">
            {t("source")}
          </label>
          <Select
            id="source"
            value={source}
            onChange={(next) => {
              setPage(1);
              setSource(next);
            }}
            className="sm:w-40"
            options={[
              { value: "", label: t("sourceAll") },
              ...sourceOptions.map((entry) => ({
                value: entry.slug,
                label: entry.name,
              })),
            ]}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="date-from">
            {t("dateFrom")}
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setPage(1);
              setDateFrom(e.target.value);
            }}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-foreground outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="date-to">
            {t("dateTo")}
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setPage(1);
              setDateTo(e.target.value);
            }}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-foreground outline-none focus:border-white/30"
          />
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-xl border border-white/15 px-4 py-3 text-sm text-foreground transition hover:bg-white/5"
        >
          {t("apply")}
        </button>
      </div>

      {ordersQuery.isLoading ? <TableSkeleton rows={6} columns={7} /> : null}
      {ordersQuery.isError ? <p className="text-sm text-red-300">{t("unableToLoad")}</p> : null}

      {orders.length > 0 ? (
        <div
          className={`overflow-x-auto rounded-2xl border border-white/10 transition ${
            ordersQuery.isFetching ? "opacity-70" : ""
          }`}
        >
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/3 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t("number")}</th>
                <th className="px-4 py-3 font-medium">{t("customer")}</th>
                <th className="px-4 py-3 font-medium">{t("source")}</th>
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
                  <td className="px-4 py-3 text-muted">
                    {order.source_label ?? order.source ?? "Web"}
                    {order.external_ref ? (
                      <span className="mt-0.5 block text-xs">{order.external_ref}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatEuroFromCents(order.total_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      disabled={pending}
                      size="sm"
                      onChange={(next) => {
                        void updateStatus
                          .mutateAsync({
                            id: order.id,
                            status: next as OrderStatus,
                          })
                          .then(() => toast(t("updatedToast")))
                          .catch(() => toast(t("unableToUpdate"), { variant: "error" }));
                      }}
                      options={STATUSES.map((value) => ({
                        value,
                        label: t(`status_${value}`),
                      }))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.payment_status}
                      disabled={pending}
                      size="sm"
                      onChange={(next) => {
                        void updatePayment
                          .mutateAsync({
                            id: order.id,
                            payment_status: next as PaymentStatus,
                          })
                          .then(() => toast(t("updatedToast")))
                          .catch(() => toast(t("unableToUpdate"), { variant: "error" }));
                      }}
                      options={[
                        { value: "unpaid", label: t("payment_unpaid") },
                        { value: "paid", label: t("payment_paid") },
                      ]}
                    />
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

      {meta ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            {t("pageOf", { current: currentPage, total: lastPage })} ·{" "}
            {t("totalCount", { count: total })}
          </p>
          {lastPage > 1 ? (
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
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                {t("next")}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
