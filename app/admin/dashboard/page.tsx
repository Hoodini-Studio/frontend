import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");

  const sections = [
    { key: "orders", label: t("orders") },
    { key: "customers", label: t("customers") },
    { key: "products", label: t("products") },
  ] as const;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">{t("eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-muted">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground">{section.label}</h2>
            <p className="mt-2 text-sm text-muted">{t("comingSoon")}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
