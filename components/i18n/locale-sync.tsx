"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { setLocaleCookie } from "@/lib/i18n/cookie";
import { normalizeLocale } from "@/lib/i18n/config";

let lastLocaleSyncAttempt: string | null = null;

export function LocaleSync() {
  const locale = useLocale();
  const router = useRouter();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (!user?.preferred_locale) {
      lastLocaleSyncAttempt = null;
      return;
    }

    const preferred = normalizeLocale(user.preferred_locale);

    if (preferred === locale) {
      lastLocaleSyncAttempt = null;
      return;
    }

    const attemptKey = `${user.id}:${preferred}->${locale}`;
    if (lastLocaleSyncAttempt === attemptKey) {
      return;
    }

    lastLocaleSyncAttempt = attemptKey;
    setLocaleCookie(preferred);
    router.refresh();
  }, [user?.id, user?.preferred_locale, locale, router]);

  return null;
}
