import type { AppLocale } from "@/lib/i18n/config";
import { defaultLocale, LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function readLocaleCookie(): AppLocale {
  return normalizeLocale(getCookie(LOCALE_COOKIE));
}

export function setLocaleCookie(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function resetLocaleCookie() {
  setLocaleCookie(defaultLocale);
}
