import { getTranslations } from "next-intl/server";
import { NewsletterSubscribersList } from "@/components/admin/newsletter-subscribers-list";

export default async function AdminNewsletterPage() {
  const t = await getTranslations("adminNewsletter");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        <NewsletterSubscribersList />
      </div>
    </main>
  );
}
