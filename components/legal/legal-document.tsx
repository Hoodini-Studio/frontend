"use client";

import { useLocale, useTranslations } from "next-intl";
import { getLegalDocument, type LegalSlug } from "@/lib/legal/content";
import { pageShellClass } from "@/lib/layout";

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
  const content = getLegalDocument(doc, locale);

  return (
    <main className={pageShellClass("reading", "py-16")}>
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Hoodini Studio</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-foreground">
        {content.title}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {t("updatedLabel", { date: formatUpdatedAt(content.updatedAt, locale) })}
      </p>
      <p className="mt-2 text-sm text-muted">{t("disclaimer")}</p>

      <div className="mt-10 space-y-8 border-t border-border pt-10">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              {section.title}
            </h2>
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
