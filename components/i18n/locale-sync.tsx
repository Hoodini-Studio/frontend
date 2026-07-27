"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { setLocaleCookie } from "@/lib/i18n/cookie";
import { normalizeLocale } from "@/lib/i18n/config";

export function LocaleSync() {
  const locale = useLocale();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const lastAttemptRef = useRef<string | null>(null);
  const userId = user?.id;
  const preferredLocale = user?.preferred_locale;

  useEffect(() => {
    if (!preferredLocale || !userId) {
      lastAttemptRef.current = null;
      return;
    }

    const preferred = normalizeLocale(preferredLocale);

    if (preferred === locale) {
      lastAttemptRef.current = null;
      return;
    }

    const attemptKey = `${userId}:${preferred}->${locale}`;
    if (lastAttemptRef.current === attemptKey) {
      return;
    }

    lastAttemptRef.current = attemptKey;
    setLocaleCookie(preferred);
    router.refresh();
  }, [userId, preferredLocale, locale, router]);

  return null;
}
