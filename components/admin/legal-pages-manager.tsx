"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  listAdminLegalPages,
  updateAdminLegalPage,
  type LegalLocalePayload,
  type LegalPage,
  type LegalSlug,
} from "@/lib/api/legal";
import { ApiError } from "@/lib/api/client";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import { useToast } from "@/providers/toast-provider";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30";

const textareaClass = `${inputClass} min-h-[280px] font-mono text-xs leading-relaxed sm:min-h-[360px]`;

type LocaleDrafts = {
  en: LegalLocalePayload;
  sq: LegalLocalePayload;
};

function emptyDrafts(): LocaleDrafts {
  return {
    en: { title: "", body: "" },
    sq: { title: "", body: "" },
  };
}

function draftsFromPages(pages: LegalPage[], slug: LegalSlug): LocaleDrafts {
  const next = emptyDrafts();
  for (const page of pages) {
    if (page.slug !== slug) continue;
    if (page.locale === "en" || page.locale === "sq") {
      next[page.locale] = { title: page.title, body: page.body };
    }
  }
  return next;
}

export function LegalPagesManager() {
  const t = useTranslations("adminLegal");
  const { translateMessage } = useApiMessageTranslator();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [slug, setSlug] = useState<LegalSlug>("terms");
  const [dirty, setDirty] = useState(false);
  const [drafts, setDrafts] = useState<LocaleDrafts>(emptyDrafts);

  const listQuery = useQuery({
    queryKey: ["admin", "legal"],
    queryFn: async ({ signal }) => (await listAdminLegalPages({ signal })).data,
  });

  const serverDrafts = useMemo(
    () => (listQuery.data ? draftsFromPages(listQuery.data, slug) : emptyDrafts()),
    [listQuery.data, slug],
  );

  const activeDrafts = dirty ? drafts : serverDrafts;

  const saveMutation = useMutation({
    mutationFn: () => updateAdminLegalPage(slug, activeDrafts),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "legal"] });
      await queryClient.invalidateQueries({ queryKey: ["legal"] });
      setDrafts(draftsFromPages(response.data, slug));
      setDirty(false);
      toast(t("saved"));
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast(translateMessage(error.message) || t("unableToSave"), { variant: "error" });
        return;
      }
      toast(t("unableToSave"), { variant: "error" });
    },
  });

  const previewHref = useMemo(() => (slug === "terms" ? "/terms" : "/privacy"), [slug]);

  if (listQuery.isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-48" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-64 w-full" />
      </div>
    );
  }

  if (listQuery.isError) {
    return <p className="text-sm text-red-300">{t("unableToLoad")}</p>;
  }

  const updateLocale = (locale: "en" | "sq", field: keyof LegalLocalePayload, value: string) => {
    setDirty(true);
    setDrafts((current) => {
      const base = dirty ? current : serverDrafts;
      return {
        ...base,
        [locale]: { ...base[locale], [field]: value },
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["terms", "privacy"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setSlug(value);
              setDirty(false);
            }}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              slug === value
                ? "bg-foreground text-background"
                : "border border-white/10 text-muted hover:border-white/25 hover:text-foreground"
            }`}
          >
            {value === "terms" ? t("tabTerms") : t("tabPrivacy")}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">{t("formatHint")}</p>
      <p className="text-sm text-muted">{t("versionNote")}</p>

      <div className="grid gap-8 lg:grid-cols-2">
        {(["en", "sq"] as const).map((locale) => (
          <div key={locale} className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {locale === "en" ? t("localeEn") : t("localeSq")}
            </h2>
            <div className="space-y-2">
              <label htmlFor={`legal-title-${locale}`} className="block text-sm text-muted">
                {t("titleField")}
              </label>
              <input
                id={`legal-title-${locale}`}
                value={activeDrafts[locale].title}
                onChange={(e) => updateLocale(locale, "title", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`legal-body-${locale}`} className="block text-sm text-muted">
                {t("bodyField")}
              </label>
              <textarea
                id={`legal-body-${locale}`}
                value={activeDrafts[locale].body}
                onChange={(e) => updateLocale(locale, "body", e.target.value)}
                className={textareaClass}
                spellCheck={false}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {saveMutation.isPending ? t("saving") : t("save")}
        </button>
        <a
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("preview")}
        </a>
      </div>
    </div>
  );
}
