"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAdminOrders } from "@/hooks/use-commerce";
import { useAdminProducts } from "@/hooks/use-products";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function AdminDashboard() {
  const t = useTranslations("admin");
  const all = useAdminProducts({ perPage: 1 });
  const published = useAdminProducts({ status: "published", perPage: 1 });
  const drafts = useAdminProducts({ status: "draft", perPage: 1 });
  const allOrders = useAdminOrders({ per_page: 1 });
  const pendingOrders = useAdminOrders({ status: "pending", per_page: 1 });
  const confirmedOrders = useAdminOrders({ status: "confirmed", per_page: 1 });

  const total = all.data?.meta?.total;
  const publishedCount = published.data?.meta?.total;
  const draftCount = drafts.data?.meta?.total;
  const countsLoading = all.isLoading || published.isLoading || drafts.isLoading;

  const ordersTotal = allOrders.data?.meta?.total;
  const pendingCount = pendingOrders.data?.meta?.total;
  const confirmedCount = confirmedOrders.data?.meta?.total;
  const ordersCountsLoading =
    allOrders.isLoading || pendingOrders.isLoading || confirmedOrders.isLoading;

  return (
    <main className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(255,255,255,0.04),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <header className="max-w-2xl animate-[fade-in-up_0.7s_ease-out]">
          <p className="text-sm uppercase tracking-[0.25em] text-muted">{t("eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <section className="mt-14 animate-[fade-in-up_0.7s_ease-out] [animation-delay:120ms] [animation-fill-mode:both]">
          <Link
            href="/admin/products"
            aria-labelledby="admin-catalog-heading"
            className="group block outline-none transition focus-visible:ring-2 focus-visible:ring-white/25"
          >
            <div className="relative overflow-hidden border-t border-white/10 bg-linear-to-br from-white/6 via-white/2 to-transparent px-4 py-8 transition group-hover:from-white/9 sm:px-6 sm:py-10">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 max-w-xl">
                  <h2
                    id="admin-catalog-heading"
                    className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                  >
                    {t("products")}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    {t("productsDescription")}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                    {countsLoading ? (
                      <div className="flex gap-4">
                        <SkeletonBlock className="h-4 w-16" />
                        <SkeletonBlock className="h-4 w-20" />
                        <SkeletonBlock className="h-4 w-16" />
                      </div>
                    ) : (
                      <>
                        <span>
                          <span className="font-medium text-foreground">{total ?? 0}</span>
                          {" "}
                          {t("totalLabel")}
                        </span>
                        <span className="text-white/20" aria-hidden="true">
                          /
                        </span>
                        <span>
                          <span className="font-medium text-emerald-300/90">
                            {publishedCount ?? 0}
                          </span>
                          {" "}
                          {t("publishedLabel")}
                        </span>
                        <span className="text-white/20" aria-hidden="true">
                          /
                        </span>
                        <span>
                          <span className="font-medium text-amber-200/90">
                            {draftCount ?? 0}
                          </span>
                          {" "}
                          {t("draftLabel")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition group-hover:gap-3">
                  {t("openProducts")}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            aria-labelledby="admin-orders-heading"
            className="group block outline-none transition focus-visible:ring-2 focus-visible:ring-white/25"
          >
            <div className="relative overflow-hidden border-y border-white/10 bg-linear-to-br from-white/6 via-white/2 to-transparent px-4 py-8 transition group-hover:from-white/9 sm:px-6 sm:py-10">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 max-w-xl">
                  <h2
                    id="admin-orders-heading"
                    className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                  >
                    {t("orders")}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    {t("ordersDescription")}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                    {ordersCountsLoading ? (
                      <div className="flex gap-4">
                        <SkeletonBlock className="h-4 w-16" />
                        <SkeletonBlock className="h-4 w-20" />
                        <SkeletonBlock className="h-4 w-20" />
                      </div>
                    ) : (
                      <>
                        <span>
                          <span className="font-medium text-foreground">{ordersTotal ?? 0}</span>
                          {" "}
                          {t("totalLabel")}
                        </span>
                        <span className="text-white/20" aria-hidden="true">
                          /
                        </span>
                        <span>
                          <span className="font-medium text-amber-200/90">
                            {pendingCount ?? 0}
                          </span>
                          {" "}
                          {t("pendingLabel")}
                        </span>
                        <span className="text-white/20" aria-hidden="true">
                          /
                        </span>
                        <span>
                          <span className="font-medium text-emerald-300/90">
                            {confirmedCount ?? 0}
                          </span>
                          {" "}
                          {t("confirmedLabel")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition group-hover:gap-3">
                  {t("openOrders")}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </Link>
        </section>

        <section
          aria-labelledby="admin-more-heading"
          className="mt-16 animate-[fade-in-up_0.7s_ease-out] [animation-delay:220ms] [animation-fill-mode:both]"
        >
          <h2
            id="admin-more-heading"
            className="text-xs uppercase tracking-[0.22em] text-muted"
          >
            {t("moreSection")}
          </h2>

          <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
            <li>
              <Link
                href="/admin/catalog"
                className="group flex items-start justify-between gap-6 px-4 py-5 transition hover:bg-white/3 focus-visible:bg-white/3 focus-visible:outline-none sm:px-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-foreground">
                    {t("catalog")}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t("catalogDescription")}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="shrink-0 pt-1 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground"
                >
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/shipping"
                className="group flex items-start justify-between gap-6 px-4 py-5 transition hover:bg-white/3 focus-visible:bg-white/3 focus-visible:outline-none sm:px-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-foreground">
                    {t("shipping")}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t("shippingDescription")}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="shrink-0 pt-1 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground"
                >
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/coupons"
                className="group flex items-start justify-between gap-6 px-4 py-5 transition hover:bg-white/3 focus-visible:bg-white/3 focus-visible:outline-none sm:px-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-foreground">
                    {t("coupons")}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t("couponsDescription")}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="shrink-0 pt-1 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground"
                >
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="group flex items-start justify-between gap-6 px-4 py-5 transition hover:bg-white/3 focus-visible:bg-white/3 focus-visible:outline-none sm:px-6"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-foreground">
                    {t("users")}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t("usersDescription")}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="shrink-0 pt-1 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground"
                >
                  →
                </span>
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
