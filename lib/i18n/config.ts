export const locales = ["en", "sq"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const LOCALE_COOKIE = "locale";

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return value === "sq" || value === "en";
}

export function normalizeLocale(value: string | undefined | null): AppLocale {
  return isAppLocale(value) ? value : defaultLocale;
}
