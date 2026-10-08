"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { setLocaleCookie } from "@/lib/i18n/cookie";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";

const SYNC_ATTEMPT_KEY = "hoodini.locale-sync";

function readLocaleCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

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

    const cookieLocale = normalizeLocale(readLocaleCookie());
    if (cookieLocale !== preferred) {
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
