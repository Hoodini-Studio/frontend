"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { readLocaleCookie, setLocaleCookie } from "@/lib/i18n/cookie";
import { normalizeLocale } from "@/lib/i18n/config";

const SYNC_ATTEMPT_KEY = "hoodini.locale-sync";

export function LocaleSync() {
  const locale = normalizeLocale(useLocale());
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const userId = user?.id;
  const preferredLocale = user?.preferred_locale;

  useEffect(() => {
    if (!preferredLocale || !userId) {
      return;
    }

    const preferred = normalizeLocale(preferredLocale);

    if (preferred === locale) {
      return;
    }

    if (readLocaleCookie() !== preferred) {
      setLocaleCookie(preferred);
    }

    // Remount-safe: useRef resets after router.refresh(), which caused a loop.
    const attemptKey = `${userId}:${preferred}`;
    if (sessionStorage.getItem(SYNC_ATTEMPT_KEY) === attemptKey) {
      return;
    }

    sessionStorage.setItem(SYNC_ATTEMPT_KEY, attemptKey);
    router.refresh();
  }, [userId, preferredLocale, locale, router]);

  return null;
}

export function clearLocaleSyncAttempt() {
  try {
    sessionStorage.removeItem(SYNC_ATTEMPT_KEY);
  } catch {
    // Ignore private-mode / unavailable storage.
  }
}
