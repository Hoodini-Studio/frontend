import type { AppLocale } from "@/lib/i18n/config";
import { defaultLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

export function setLocaleCookie(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function resetLocaleCookie() {
  setLocaleCookie(defaultLocale);
}
