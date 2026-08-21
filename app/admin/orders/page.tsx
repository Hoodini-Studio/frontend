import { getTranslations } from "next-intl/server";
import { OrdersList } from "@/components/admin/orders-list";

export default async function AdminOrdersPage() {
  const t = await getTranslations("adminOrders");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <OrdersList />
      </div>
    </main>
  );
}
