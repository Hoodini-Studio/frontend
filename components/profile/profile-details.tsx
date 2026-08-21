"use client";

import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/use-auth";
import { SettingsShell } from "@/components/profile/settings-shell";

export function ProfileDetails() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { data: user } = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <SettingsShell
      backLabel={t("backToSettings")}
      eyebrow={t("eyebrow")}
      title={t("profileTitle")}
      subtitle={t("profileSubtitle")}
    >
      <dl className="space-y-6">
        <div>
          <dt className="text-xs uppercase tracking-[0.18em] text-muted">
            {tCommon("name")}
          </dt>
          <dd className="mt-2 text-lg text-foreground">{user.name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.18em] text-muted">
            {tCommon("email")}
          </dt>
          <dd className="mt-2 text-lg text-foreground">{user.email}</dd>
        </div>
      </dl>
    </SettingsShell>
  );
}
