import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrdersList } from "@/components/admin/orders-list";
import { pageShellClass } from "@/lib/layout";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const t = await getTranslations("adminOrders");

  return (
    <main className={pageShellClass("shell", "py-10")}>
      <h1 className="font-display text-3xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <OrdersList />
      </div>
    </main>
  );
}
