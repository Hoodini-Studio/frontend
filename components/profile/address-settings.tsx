"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAdmin } from "@/lib/auth/roles";
import { SettingsShell } from "@/components/profile/settings-shell";
import { ShippingAddressForm } from "@/components/profile/shipping-address-form";

export function AddressSettings() {
  const t = useTranslations("settings");
  const router = useRouter();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (user && isAdmin(user)) {
      router.replace("/account-settings");
    }
  }, [router, user]);

  if (!user || isAdmin(user)) {
    return null;
  }

  return (
    <SettingsShell
      backLabel={t("backToSettings")}
      eyebrow={t("eyebrow")}
      title={t("addressTitle")}
      subtitle={t("shippingAddressHint")}
    >
      <ShippingAddressForm />
    </SettingsShell>
  );
}
