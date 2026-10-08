"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getLegalPage, parseLegalBody, type LegalSlug } from "@/lib/api/legal";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

function formatUpdatedAt(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function LegalDocument({ doc }: { doc: LegalSlug }) {
  const t = useTranslations("legal");
  const locale = useLocale();

  const query = useQuery({
    queryKey: ["legal", doc, locale],
    queryFn: async ({ signal }) => (await getLegalPage(doc, locale, { signal })).data,
  });

  if (query.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <SkeletonBlock className="h-10 w-2/3" />
        <SkeletonBlock className="mt-4 h-4 w-1/2" />
        <div className="mt-10 space-y-6">
          <SkeletonBlock className="h-6 w-1/3" />
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-6 w-1/3" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </main>
    );
  }

  if (query.isError || !query.data) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          {doc === "terms" ? t("termsTitle") : t("privacyTitle")}
        </h1>
        <p className="mt-4 text-sm text-red-300">{t("unableToLoad")}</p>
      </main>
    );
  }

  const sections = parseLegalBody(query.data.body);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-foreground">{query.data.title}</h1>
      <p className="mt-3 text-sm text-muted">
        {t("updatedLabel", { date: formatUpdatedAt(query.data.updated_at, locale) })}
      </p>
      <p className="mt-2 text-sm text-muted">{t("disclaimer")}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-foreground">{section.title}</h2>
            {section.body ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                {section.body}
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
