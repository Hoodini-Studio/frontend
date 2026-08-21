"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  useAdminShippingZones,
  useUpdateShippingZoneMutation,
} from "@/hooks/use-commerce";
import {
  appendPriceDigit,
  formatPriceEntry,
  removePriceDigit,
} from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { ShippingZone } from "@/types/commerce";
import type { FormEvent, KeyboardEvent } from "react";
import { ListRowsSkeleton } from "@/components/ui/list-rows-skeleton";

function FeeInput({
  cents,
  onChange,
  id,
}: {
  cents: number;
  onChange: (cents: number) => void;
  id: string;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      onChange(removePriceDigit(cents));
    }
  };

  const handleBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const inputEvent = event.nativeEvent as InputEvent;
    const data = inputEvent.data;
    if (
      inputEvent.inputType === "deleteContentBackward" ||
      inputEvent.inputType === "deleteContentForward"
    ) {
      event.preventDefault();
      onChange(removePriceDigit(cents));
      return;
    }
    if (data == null) return;
    event.preventDefault();
    if (/^\d$/.test(data)) {
      onChange(appendPriceDigit(cents, Number(data)));
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatPriceEntry(cents)}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onChange={() => {}}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-10 font-mono text-sm text-foreground outline-none focus:border-white/30"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
        €
      </span>
    </div>
  );
}

function ZoneEditor({ zone }: { zone: ShippingZone }) {
  const t = useTranslations("adminShipping");
  const { toast } = useToast();
  const updateZone = useUpdateShippingZoneMutation();
  const [fee, setFee] = useState(zone.delivery_fee_cents);
  const [minQty, setMinQty] = useState(
    zone.free_shipping_min_qty !== null ? String(zone.free_shipping_min_qty) : "",
  );
  const [minSubtotal, setMinSubtotal] = useState(zone.free_shipping_min_subtotal_cents ?? 0);
  const [hasMinSubtotal, setHasMinSubtotal] = useState(
    zone.free_shipping_min_subtotal_cents !== null,
  );
  const [isActive, setIsActive] = useState(zone.is_active);

  const save = async () => {
    try {
      await updateZone.mutateAsync({
        id: zone.id,
        payload: {
          delivery_fee_cents: fee,
          free_shipping_min_qty: minQty.trim() ? Number(minQty) : null,
          free_shipping_min_subtotal_cents: hasMinSubtotal ? minSubtotal : null,
          is_active: isActive,
        },
      });
      toast(t("savedToast"));
    } catch {
      toast(t("unableToSave"), { variant: "error" });
    }
  };

  return (
    <li className="space-y-4 border border-white/10 bg-white/3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            {zone.name_en} / {zone.name_sq}
          </p>
          <p className="text-xs text-muted">{zone.country_code}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          {t("active")}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor={`fee-${zone.id}`}>
            {t("deliveryFee")}
          </label>
          <FeeInput id={`fee-${zone.id}`} cents={fee} onChange={setFee} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted" htmlFor={`qty-${zone.id}`}>
            {t("freeMinQty")}
          </label>
          <input
            id={`qty-${zone.id}`}
            type="number"
            min={1}
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            placeholder={t("optional")}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none focus:border-white/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={hasMinSubtotal}
              onChange={(e) => setHasMinSubtotal(e.target.checked)}
            />
            {t("freeMinSubtotal")}
          </label>
          {hasMinSubtotal ? (
            <FeeInput
              id={`subtotal-${zone.id}`}
              cents={minSubtotal}
              onChange={setMinSubtotal}
            />
          ) : null}
        </div>
      </div>

      <button
        type="button"
        disabled={updateZone.isPending}
        onClick={() => void save()}
        className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
      >
        {t("save")}
      </button>
    </li>
  );
}

export function ShippingManager() {
  const t = useTranslations("adminShipping");
  const zonesQuery = useAdminShippingZones();

  if (zonesQuery.isLoading) {
    return <ListRowsSkeleton rows={3} />;
  }

  if (zonesQuery.isError) {
    return <p className="text-sm text-red-300">{t("unableToLoad")}</p>;
  }

  return (
    <ul className="space-y-4">
      {(zonesQuery.data ?? []).map((zone) => (
        <ZoneEditor key={zone.id} zone={zone} />
      ))}
    </ul>
  );
}
