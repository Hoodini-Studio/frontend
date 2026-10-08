"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMyOrders } from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import type { Order, OrderStatus } from "@/types/commerce";

function formatOrderDate(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusClass(status: OrderStatus): string {
  switch (status) {
    case "confirmed":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
    case "shipped":
      return "border-sky-400/25 bg-sky-400/10 text-sky-200";
    case "delivered":
      return "border-white/20 bg-white/10 text-foreground";
    case "cancelled":
      return "border-red-400/25 bg-red-400/10 text-red-200";
    case "pending":
    default:
      return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }
}

function itemSummary(order: Order, t: (key: string, values?: Record<string, number>) => string): string {
  const items = order.items ?? [];
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  if (count === 0) {
    return t("myOrdersItemsUnknown");
  }
  if (items.length === 1) {
    const first = items[0];
    return `${first.name} × ${first.quantity}`;
  }
  return t("myOrdersItemsCount", { count });
}

function OrdersSkeleton() {
  return (
    <ul className="mt-10 space-y-4" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <li
          key={index}
          className="border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-3 w-48" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
            <SkeletonBlock className="h-5 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MyOrdersPageContent() {
  const t = useTranslations("store");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const ordersQuery = useMyOrders({ page, per_page: 10 });
  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;

  return (
    <div className="relative isolate mx-auto min-h-[calc(100vh-4rem)] max-w-3xl px-6 py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-15%,rgba(255,255,255,0.07),transparent_55%)]" />
      </div>

      <header className="max-w-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">{t("myOrdersEyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("myOrdersTitle")}
        </h1>
        <p className="mt-3 text-muted">{t("myOrdersSubtitle")}</p>
      </header>

      {ordersQuery.isLoading ? (
        <>
          <span className="sr-only">{t("cartLoading")}</span>
          <OrdersSkeleton />
        </>
      ) : null}

      {ordersQuery.isError ? (
        <p className="mt-10 text-sm text-red-300">{t("myOrdersUnable")}</p>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
        <div className="mt-12 max-w-md border border-white/10 bg-white/[0.03] px-6 py-10">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {t("myOrdersEmptyTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("myOrdersEmpty")}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            {t("backToShop")}
          </Link>
        </div>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 ? (
        <>
          <ul className="mt-10 space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="group block border border-white/10 bg-white/[0.03] px-5 py-5 transition hover:border-white/20 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 sm:px-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-medium text-foreground sm:text-base">
                          {order.number}
                        </p>
                        <span
                          className={`inline-flex border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${statusClass(order.status)}`}
                        >
                          {t(`orderStatus_${order.status}`)}
                        </span>
                      </div>
                      <p className="text-sm text-muted">{itemSummary(order, t)}</p>
                      <p className="text-xs text-muted">
                        {formatOrderDate(order.created_at, locale)}
                        {" · "}
                        {order.city}, {order.country_code}
                        {" · "}
                        {t(`payment_${order.payment_method}`)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                      <p className="font-display text-lg font-semibold text-foreground">
                        {formatEuroFromCents(order.total_cents)}
                      </p>
                      <span className="text-sm text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground">
                        {t("myOrdersView")} →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {meta && meta.last_page > 1 ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={page <= 1 || ordersQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm text-foreground transition hover:border-white/30 disabled:opacity-40"
              >
                {t("myOrdersPrev")}
              </button>
              <p className="text-sm text-muted">
                {t("myOrdersPage", {
                  current: meta.current_page,
                  last: meta.last_page,
                })}
              </p>
              <button
                type="button"
                disabled={page >= meta.last_page || ordersQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm text-foreground transition hover:border-white/30 disabled:opacity-40"
              >
                {t("myOrdersNext")}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {!ordersQuery.isLoading && orders.length > 0 ? (
        <Link
          href="/"
          className="mt-10 inline-flex text-sm text-muted underline-offset-4 transition hover:text-foreground hover:underline"
        >
          {t("backToShop")}
        </Link>
      ) : null}
    </div>
  );
}
