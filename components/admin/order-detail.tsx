"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { use } from "react";
import { useAdminOrder } from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { OrderDetailSkeleton } from "@/components/ui/order-detail-skeleton";

function formatPlacedAt(value: string, locale: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("adminOrders");
  const locale = useLocale();
  const orderQuery = useAdminOrder(id);
  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (orderQuery.isError || !order) {
    return <p className="text-sm text-red-300">{t("unableToLoad")}</p>;
  }

  return (
    <div className="space-y-8 print:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">
          ← {t("title")}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-foreground transition hover:border-white/30 hover:bg-white/5"
        >
          {t("print")}
        </button>
      </div>

      <div className="order-print-sheet space-y-8 rounded-2xl border border-white/10 bg-white/3 p-6 print:space-y-3 print:rounded-none print:border-0 print:bg-transparent print:p-0">
        <header className="space-y-2 border-b border-white/10 pb-6 print:space-y-1 print:border-black/20 print:pb-2">
          <p className="hidden text-xs uppercase tracking-[0.2em] text-muted print:block print:text-[9px] print:text-black/60">
            Hoodini Studio · {t("printTitle")}
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground print:text-black">
            {order.number}
          </h1>
          <p className="text-sm text-muted print:hidden">
            {t(`status_${order.status}`)} · {t(`payment_${order.payment_status}`)} ·{" "}
            {t(`payment_${order.payment_method}`)}
          </p>
          <p className="text-sm text-muted print:text-[10px] print:text-black/70">
            {t("placedAt")}: {formatPlacedAt(order.created_at, locale)}
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 print:gap-3">
          <section className="space-y-2 text-sm print:space-y-0.5">
            <h2 className="text-xs uppercase tracking-[0.18em] text-muted print:text-black/60">
              {t("contact")}
            </h2>
            <p className="text-foreground print:text-black">{order.customer_name}</p>
            <p className="text-muted print:text-black/80">{order.phone}</p>
            {order.email ? (
              <p className="text-muted print:text-black/80">{order.email}</p>
            ) : null}
          </section>

          <section className="space-y-2 text-sm print:space-y-0.5">
            <h2 className="text-xs uppercase tracking-[0.18em] text-muted print:text-black/60">
              {t("shipTo")}
            </h2>
            <p className="text-foreground print:text-black">{order.address_line}</p>
            <p className="text-muted print:text-black/80">
              {order.city}
              {order.postal_code ? `, ${order.postal_code}` : ""}
            </p>
            <p className="text-muted print:text-black/80">{order.country_code}</p>
            {order.notes ? (
              <p className="text-muted print:text-black/80">
                {t("notes")}: {order.notes}
              </p>
            ) : null}
          </section>
        </div>

        <section>
          <h2 className="mb-3 text-xs uppercase tracking-[0.18em] text-muted print:mb-1 print:text-black/60">
            {t("items")}
          </h2>
          <ul className="divide-y divide-white/10 border-y border-white/10 text-sm print:divide-black/15 print:border-black/20">
            {(order.items ?? []).map((item) => {
              const details = [item.color_label, item.size_label, item.gender_label]
                .filter(Boolean)
                .join(" · ");

              return (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 py-3 print:gap-2 print:py-1.5 print:text-black"
                >
                  <div>
                    <p className="text-foreground print:text-black">
                      {item.name} × {item.quantity}
                    </p>
                    {details ? (
                      <p className="mt-1 text-xs text-muted print:mt-0.5 print:text-[9px] print:text-black/70">
                        {details}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-muted print:text-black/80">
                    {formatEuroFromCents(item.line_total_cents)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-1 text-sm print:space-y-0.5">
          <div className="flex justify-between text-muted print:text-black/70">
            <span>{t("subtotal")}</span>
            <span>{formatEuroFromCents(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-muted print:text-black/70">
            <span>{t("shipping")}</span>
            <span>{formatEuroFromCents(order.shipping_cents)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 text-base font-medium text-foreground print:border-black/20 print:pt-1 print:text-[12px] print:text-black">
            <span>{t("total")}</span>
            <span>{formatEuroFromCents(order.total_cents)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
