"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AuthOnly } from "@/components/auth/auth-only";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { useMyOrders } from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

function MyOrdersContent() {
  const t = useTranslations("store");
  const ordersQuery = useMyOrders();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        {t("myOrdersTitle")}
      </h1>

      {ordersQuery.isLoading ? (
        <div className="mt-8" aria-busy="true">
          <span className="sr-only">{t("cartLoading")}</span>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="flex items-center justify-between gap-4 py-4">
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="h-4 w-14" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {ordersQuery.isError ? (
        <p className="mt-8 text-sm text-red-300">{t("myOrdersUnable")}</p>
      ) : null}

      {!ordersQuery.isLoading && (ordersQuery.data?.length ?? 0) === 0 ? (
        <p className="mt-8 text-sm text-muted">{t("myOrdersEmpty")}</p>
      ) : null}

      {(ordersQuery.data?.length ?? 0) > 0 ? (
        <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {(ordersQuery.data ?? []).map((order) => (
            <li key={order.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-foreground">{order.number}</p>
                <p className="text-xs text-muted">
                  {order.status} · {order.country_code}
                </p>
              </div>
              <p className="text-sm text-foreground">{formatEuroFromCents(order.total_cents)}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <Link href="/" className="mt-8 inline-flex text-sm text-muted hover:text-foreground">
        {t("backToShop")}
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthOnly>
      <StorefrontOnly>
        <main>
          <MyOrdersContent />
        </main>
      </StorefrontOnly>
    </AuthOnly>
  );
}
