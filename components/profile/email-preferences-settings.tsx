"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCurrentUser,
  useUpdateEmailPreferencesMutation,
} from "@/hooks/use-auth";
import { isAdmin } from "@/lib/auth/roles";
import { SettingsShell } from "@/components/profile/settings-shell";
import type { EmailPreferencesInput } from "@/types/user";

type PrefKey = keyof EmailPreferencesInput;

export function EmailPreferencesSettings() {
  const t = useTranslations("settings");
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const updatePrefs = useUpdateEmailPreferencesMutation();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingKey, setPendingKey] = useState<PrefKey | null>(null);

  useEffect(() => {
    if (user && isAdmin(user)) {
      router.replace("/account-settings");
    }
  }, [router, user]);

  if (!user || isAdmin(user)) {
    return null;
  }

  const prefs: Array<{ key: PrefKey; label: string; hint: string; value: boolean }> = [
    {
      key: "marketing_new_drops",
      label: t("emailPrefNewDrops"),
      hint: t("emailPrefNewDropsHint"),
      value: user.marketing_new_drops,
    },
    {
      key: "marketing_studio_updates",
      label: t("emailPrefStudioUpdates"),
      hint: t("emailPrefStudioUpdatesHint"),
      value: user.marketing_studio_updates,
    },
  ];

  const toggle = async (key: PrefKey, next: boolean) => {
    if (updatePrefs.isPending) {
      return;
    }

    setError(false);
    setSuccess(false);
    setPendingKey(key);

    try {
      await updatePrefs.mutateAsync({ [key]: next });
      setSuccess(true);
    } catch {
      setError(true);
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <SettingsShell
      backLabel={t("backToSettings")}
      eyebrow={t("eyebrow")}
      title={t("emailsTitle")}
      subtitle={t("emailsDescription")}
    >
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {prefs.map((pref) => (
          <li
            key={pref.key}
            className="flex items-start justify-between gap-4 py-5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{pref.label}</p>
              <p className="mt-1 text-sm text-muted">{pref.hint}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pref.value}
              disabled={updatePrefs.isPending}
              onClick={() => void toggle(pref.key, !pref.value)}
              className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:opacity-60 ${
                pref.value
                  ? "border-white/40 bg-white/20"
                  : "border-white/15 bg-black/40"
              }`}
            >
              <span
                aria-hidden
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition ${
                  pref.value ? "left-6" : "left-0.5"
                } ${pendingKey === pref.key ? "opacity-70" : ""}`}
              />
              <span className="sr-only">{pref.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {updatePrefs.isPending ? (
        <p className="mt-4 text-sm text-muted">{t("savingEmailPrefs")}</p>
      ) : null}
      {success ? (
        <p className="mt-4 text-sm text-emerald-300">{t("emailPrefsUpdated")}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-400">{t("unableToUpdateEmailPrefs")}</p>
      ) : null}
    </SettingsShell>
  );
}
