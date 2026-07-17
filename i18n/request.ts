import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, LOCALE_COOKIE, normalizeLocale, type AppLocale } from "@/lib/i18n/config";
import en from "../messages/en.json";
import sq from "../messages/sq.json";

const messagesByLocale = {
  en,
  sq,
} as const satisfies Record<AppLocale, typeof sq>;

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value ?? defaultLocale);

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
