"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCurrentUser,
  useUpdatePreferredLocaleMutation,
} from "@/hooks/use-auth";
import { setLocaleCookie } from "@/lib/i18n/cookie";
import { type AppLocale, locales } from "@/lib/i18n/config";
import { SettingsShell } from "@/components/profile/settings-shell";

export function LanguageSettings() {
  const t = useTranslations("settings");
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const updateLocaleMutation = useUpdatePreferredLocaleMutation();
  const [localeError, setLocaleError] = useState(false);
  const [localeSuccess, setLocaleSuccess] = useState(false);

  if (!user) {
    return null;
  }

  const handleLocaleChange = async (locale: AppLocale) => {
    if (user.preferred_locale === locale || updateLocaleMutation.isPending) {
      return;
    }

    setLocaleError(false);
    setLocaleSuccess(false);

    try {
      await updateLocaleMutation.mutateAsync(locale);
      setLocaleCookie(locale);
      setLocaleSuccess(true);
      router.refresh();
    } catch {
      setLocaleError(true);
    }
  };

  return (
    <SettingsShell
      backLabel={t("backToSettings")}
      eyebrow={t("eyebrow")}
      title={t("languageTitle")}
      subtitle={t("languageDescription")}
    >
      <div className="flex flex-wrap gap-3">
        {locales.map((locale) => {
          const selected = user.preferred_locale === locale;
          const label = locale === "sq" ? t("albanian") : t("english");

          return (
            <button
              key={locale}
              type="button"
              onClick={() => void handleLocaleChange(locale)}
              disabled={updateLocaleMutation.isPending}
              aria-pressed={selected}
              className={`rounded-xl border px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "border-white/40 bg-white/10 text-foreground"
                  : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {updateLocaleMutation.isPending ? (
        <p className="mt-4 text-sm text-muted">{t("savingLanguage")}</p>
      ) : null}
      {localeSuccess ? (
        <p className="mt-4 text-sm text-emerald-300">{t("languageUpdated")}</p>
      ) : null}
      {localeError ? (
        <p className="mt-4 text-sm text-red-400">{t("unableToUpdateLanguage")}</p>
      ) : null}
    </SettingsShell>
  );
}
