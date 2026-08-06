import type { AppLocale } from "@/lib/i18n/config";

type LocalizedFields = {
  name?: string | null;
  name_en?: string | null;
  name_sq?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_sq?: string | null;
};

export function localizedName(
  item: Pick<LocalizedFields, "name" | "name_en" | "name_sq">,
  locale: AppLocale,
): string {
  const primary = locale === "en" ? item.name_en : item.name_sq;
  const fallback = locale === "en" ? item.name_sq : item.name_en;

  return (primary?.trim() || fallback?.trim() || item.name?.trim() || "").trim();
}

export function localizedDescription(
  item: Pick<LocalizedFields, "description" | "description_en" | "description_sq">,
  locale: AppLocale,
): string | null {
  const primary = locale === "en" ? item.description_en : item.description_sq;
  const fallback = locale === "en" ? item.description_sq : item.description_en;
  const value = primary?.trim() || fallback?.trim() || item.description?.trim() || "";

  return value || null;
}
