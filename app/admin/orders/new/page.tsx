import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ManualOrderForm } from "@/components/admin/manual-order-form";
import { pageShellClass } from "@/lib/layout";

export const metadata: Metadata = {
  title: "New order",
  robots: { index: false, follow: false },
};

export default async function AdminNewOrderPage() {
  const t = await getTranslations("adminOrders");

  return (
    <main className={pageShellClass("shell", "py-10")}>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <span aria-hidden="true">←</span>
        {t("title")}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold text-foreground">
        {t("newOrderTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{t("newOrderSubtitle")}</p>
      <div className="mt-8">
        <ManualOrderForm />
      </div>
    </main>
  );
}
