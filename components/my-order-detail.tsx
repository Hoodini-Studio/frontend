"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMyOrder } from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import type { OrderStatus } from "@/types/commerce";

function formatOrderDate(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

export function MyOrderDetailContent({ orderId }: { orderId: string }) {
  const t = useTranslations("store");
  const locale = useLocale();
  const orderQuery = useMyOrder(orderId);

  if (orderQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-4 h-10 w-64" />
        <SkeletonBlock className="mt-8 h-40 w-full" />
        <SkeletonBlock className="mt-4 h-32 w-full" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-sm text-red-300">{t("myOrderUnable")}</p>
        <Link
          href="/orders"
          className="mt-6 inline-flex text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("myOrdersBack")}
        </Link>
      </div>
    );
  }

  const order = orderQuery.data;
  const items = order.items ?? [];

  return (
    <div className="relative isolate mx-auto min-h-[calc(100vh-4rem)] max-w-3xl px-6 py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-15%,rgba(255,255,255,0.07),transparent_55%)]" />
      </div>

      <Link
        href="/orders"
        className="text-sm text-muted underline-offset-4 transition hover:text-foreground hover:underline"
      >
        ← {t("myOrdersBack")}
      </Link>

      <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">{t("myOrdersEyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {order.number}
          </h1>
          <p className="mt-2 text-sm text-muted">{formatOrderDate(order.created_at, locale)}</p>
        </div>
        <span
          className={`inline-flex w-fit border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${statusClass(order.status)}`}
        >
          {t(`orderStatus_${order.status}`)}
        </span>
      </header>

      <section className="mt-10 border border-white/10 bg-white/[0.03] px-5 py-6 sm:px-6">
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted">{t("myOrderItems")}</h2>
        <ul className="mt-4 divide-y divide-white/10">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {item.name}
                  <span className="text-muted"> × {item.quantity}</span>
                </p>
                {item.bundle_name ? (
                  <p className="mt-1 text-xs text-muted">
                    {t("orderPackLabel", { name: item.bundle_name })}
                  </p>
                ) : null}
                {(item.size_label || item.color_label || item.gender_label) ? (
                  <p className="mt-1 text-xs text-muted">
                    {[item.gender_label, item.color_label, item.size_label]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm text-foreground">
                {formatEuroFromCents(item.line_total_cents)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>{t("cartSubtotal")}</span>
            <span>{formatEuroFromCents(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{t("checkoutShipping")}</span>
            <span>{formatEuroFromCents(order.shipping_cents)}</span>
          </div>
          {order.discount_cents > 0 ? (
            <div className="flex justify-between text-muted">
              <span>
                {t("checkoutDiscount")}
                {order.coupon_code ? ` (${order.coupon_code})` : ""}
              </span>
              <span>−{formatEuroFromCents(order.discount_cents)}</span>
            </div>
          ) : null}
          <div className="flex justify-between pt-1 font-display text-base font-semibold text-foreground">
            <span>{t("checkoutTotal")}</span>
            <span>{formatEuroFromCents(order.total_cents)}</span>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6">
          <h2 className="text-xs uppercase tracking-[0.18em] text-muted">{t("myOrderDelivery")}</h2>
          <p className="mt-3 text-sm text-foreground">{order.customer_name}</p>
          <p className="mt-1 text-sm text-muted">{order.phone}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {order.address_line}
            <br />
            {order.postal_code ? `${order.postal_code} ` : ""}
            {order.city}
            <br />
            {order.country_code}
          </p>
        </div>
        <div className="border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6">
          <h2 className="text-xs uppercase tracking-[0.18em] text-muted">{t("myOrderPayment")}</h2>
          <p className="mt-3 text-sm text-foreground">{t(`payment_${order.payment_method}`)}</p>
          <p className="mt-1 text-sm text-muted">{t(`paymentStatus_${order.payment_status}`)}</p>
          {order.notes ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              <span className="text-foreground">{t("checkoutNotes")}: </span>
              {order.notes}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
