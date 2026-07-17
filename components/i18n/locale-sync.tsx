"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { setLocaleCookie } from "@/lib/i18n/cookie";
import { normalizeLocale } from "@/lib/i18n/config";

/**
 * Keeps the locale cookie aligned with the signed-in user's preference.
 * Cookie from a previous account must not stick after login/logout.
 */
export function LocaleSync() {
  const locale = useLocale();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const lastAttempt = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.preferred_locale) {
      lastAttempt.current = null;
      return;
    }

    const preferred = normalizeLocale(user.preferred_locale);

    if (preferred === locale) {
      lastAttempt.current = null;
      return;
    }

    // Only skip a repeated attempt for the same user/locale mismatch.
    const attemptKey = `${user.id}:${preferred}->${locale}`;
    if (lastAttempt.current === attemptKey) {
      return;
    }

    lastAttempt.current = attemptKey;
    setLocaleCookie(preferred);
    router.refresh();
  }, [user?.id, user?.preferred_locale, locale, router]);

  return null;
}
