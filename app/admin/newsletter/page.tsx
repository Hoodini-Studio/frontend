import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewsletterSubscribersList } from "@/components/admin/newsletter-subscribers-list";
import { pageShellClass } from "@/lib/layout";

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false, follow: false },
};

export default async function AdminNewsletterPage() {
  const t = await getTranslations("adminNewsletter");

  return (
    <main className={pageShellClass("shell", "py-10")}>
      <h1 className="font-display text-3xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <NewsletterSubscribersList />
      </div>
    </main>
  );
}
