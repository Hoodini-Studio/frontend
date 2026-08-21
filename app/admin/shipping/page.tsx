import { getTranslations } from "next-intl/server";
import { ShippingManager } from "@/components/admin/shipping-manager";

export default async function AdminShippingPage() {
  const t = await getTranslations("adminShipping");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <ShippingManager />
      </div>
    </main>
  );
}
