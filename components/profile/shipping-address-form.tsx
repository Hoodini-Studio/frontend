"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  useShippingZones,
  useUpdateShippingProfileMutation,
} from "@/hooks/use-commerce";
import type { CountryCode } from "@/types/commerce";

export function ShippingAddressForm() {
  const t = useTranslations("settings");
  const { data: user } = useCurrentUser();
  const zonesQuery = useShippingZones();
  const updateProfile = useUpdateShippingProfileMutation();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [countryCode, setCountryCode] = useState<CountryCode | "">(
    user?.shipping_country_code ?? "",
  );
  const [city, setCity] = useState(user?.shipping_city ?? "");
  const [addressLine, setAddressLine] = useState(user?.shipping_address_line ?? "");
  const [postalCode, setPostalCode] = useState(user?.shipping_postal_code ?? "");
  const [syncedUserId, setSyncedUserId] = useState(user?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (user && user.id !== syncedUserId) {
    setSyncedUserId(user.id);
    setPhone(user.phone ?? "");
    setCountryCode(user.shipping_country_code ?? "");
    setCity(user.shipping_city ?? "");
    setAddressLine(user.shipping_address_line ?? "");
    setPostalCode(user.shipping_postal_code ?? "");
  }

  const save = async () => {
    setMessage(null);
    setError(null);
    try {
      await updateProfile.mutateAsync({
        phone: phone.trim() || null,
        shipping_country_code: countryCode || null,
        shipping_city: city.trim() || null,
        shipping_address_line: addressLine.trim() || null,
        shipping_postal_code: postalCode.trim() || null,
      });
      setMessage(t("addressSaved"));
    } catch {
      setError(t("unableToSaveAddress"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="settings-phone">
            {t("phone")}
          </label>
          <input
            id="settings-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="settings-country">
            {t("country")}
          </label>
          <select
            id="settings-country"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value as CountryCode | "")}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30"
          >
            <option value="">{t("countryPlaceholder")}</option>
            {(zonesQuery.data ?? []).map((zone) => (
              <option key={zone.id} value={zone.country_code}>
                {zone.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="settings-city">
            {t("city")}
          </label>
          <input
            id="settings-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor="settings-postal">
            {t("postalCode")}
          </label>
          <input
            id="settings-postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm text-muted" htmlFor="settings-address">
            {t("addressLine")}
          </label>
          <input
            id="settings-address"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30"
          />
        </div>
      </div>
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="button"
        disabled={updateProfile.isPending}
        onClick={() => void save()}
        className="rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {updateProfile.isPending ? t("savingLanguage") : t("saveAddress")}
      </button>
    </div>
  );
}
