"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import {
  useAdminCoupons,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useUpdateCouponMutation,
} from "@/hooks/use-commerce";
import {
  appendPriceDigit,
  formatEuroFromCents,
  formatPriceEntry,
  removePriceDigit,
} from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { Coupon, CouponType } from "@/types/commerce";
import { DateTimePicker } from "@/components/ui/date-picker";
import { ListRowsSkeleton } from "@/components/ui/list-rows-skeleton";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30";

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
        className={`${inputClass} pr-10 font-mono`}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
        €
      </span>
    </div>
  );
}

function toApiDateTime(localValue: string): string | null {
  const match = localValue.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function formatDateLabel(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CouponRow({ coupon }: { coupon: Coupon }) {
  const t = useTranslations("adminCoupons");
  const { toast } = useToast();
  const updateCoupon = useUpdateCouponMutation();
  const deleteCoupon = useDeleteCouponMutation();

  const valueLabel =
    coupon.type === "percent"
      ? `${coupon.value}%`
      : formatEuroFromCents(coupon.value);

  const starts = formatDateLabel(coupon.starts_at);
  const ends = formatDateLabel(coupon.ends_at);
  const meta: string[] = [
    coupon.type === "percent" ? t("typePercent") : t("typeFixed"),
    valueLabel,
    t("uses", { count: coupon.uses_count, max: coupon.max_uses ?? "∞" }),
  ];

  if (coupon.max_uses_per_user !== null) {
    meta.push(t("perUserShort", { count: coupon.max_uses_per_user }));
  }
  if (coupon.min_subtotal_cents !== null) {
    meta.push(t("minSubtotalShort", { amount: formatEuroFromCents(coupon.min_subtotal_cents) }));
  }
  if (starts) {
    meta.push(t("startsShort", { date: starts }));
  }
  if (ends) {
    meta.push(t("endsShort", { date: ends }));
  }

  return (
    <li className="flex flex-col gap-3 border-b border-white/10 py-5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-sm font-medium text-foreground">
          {coupon.code}
          {!coupon.is_active ? (
            <span className="ml-2 text-xs font-sans text-muted">({t("inactive")})</span>
          ) : null}
        </p>
        <p className="mt-1 text-sm text-muted">{meta.join(" · ")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={updateCoupon.isPending}
          onClick={() => {
            void updateCoupon
              .mutateAsync({
                id: coupon.id,
                payload: { is_active: !coupon.is_active },
              })
              .then(() => toast(t("updated")))
              .catch(() => toast(t("unableToUpdate"), { variant: "error" }));
          }}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-foreground transition hover:bg-white/5 disabled:opacity-60"
        >
          {coupon.is_active ? t("deactivate") : t("activate")}
        </button>
        <button
          type="button"
          disabled={deleteCoupon.isPending}
          onClick={() => {
            if (!window.confirm(t("confirmDelete", { code: coupon.code }))) {
              return;
            }
            void deleteCoupon
              .mutateAsync(coupon.id)
              .then(() => toast(t("deleted")))
              .catch(() => toast(t("unableToDelete"), { variant: "error" }));
          }}
          className="rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
        >
          {t("delete")}
        </button>
      </div>
    </li>
  );
}

export function CouponsManager() {
  const t = useTranslations("adminCoupons");
  const { toast } = useToast();
  const couponsQuery = useAdminCoupons();
  const createCoupon = useCreateCouponMutation();
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [percentValue, setPercentValue] = useState("10");
  const [fixedCents, setFixedCents] = useState(500);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("");
  const [hasMinSubtotal, setHasMinSubtotal] = useState(false);
  const [minSubtotalCents, setMinSubtotalCents] = useState(0);

  const resetForm = () => {
    setCode("");
    setType("percent");
    setPercentValue("10");
    setFixedCents(500);
    setStartsAt("");
    setEndsAt("");
    setMaxUses("");
    setMaxUsesPerUser("");
    setHasMinSubtotal(false);
    setMinSubtotalCents(0);
  };

  const submit = () => {
    const parsedMaxUses = maxUses.trim() === "" ? null : Number(maxUses);
    const parsedMaxPerUser =
      maxUsesPerUser.trim() === "" ? null : Number(maxUsesPerUser);

    if (parsedMaxUses !== null && (!Number.isInteger(parsedMaxUses) || parsedMaxUses < 1)) {
      toast(t("invalidMaxUses"), { variant: "error" });
      return;
    }

    if (
      parsedMaxPerUser !== null &&
      (!Number.isInteger(parsedMaxPerUser) || parsedMaxPerUser < 1)
    ) {
      toast(t("invalidMaxUsesPerUser"), { variant: "error" });
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: type === "percent" ? Number(percentValue) : fixedCents,
      is_active: true,
      starts_at: toApiDateTime(startsAt),
      ends_at: toApiDateTime(endsAt),
      max_uses: parsedMaxUses,
      max_uses_per_user: parsedMaxPerUser,
      min_subtotal_cents: hasMinSubtotal ? minSubtotalCents : null,
    };

    void createCoupon
      .mutateAsync(payload)
      .then(() => {
        toast(t("created"));
        resetForm();
      })
      .catch(() => toast(t("unableToCreate"), { variant: "error" }));
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/3 p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("createTitle")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="coupon-code">
              {t("code")}
            </label>
            <input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="coupon-type">
              {t("type")}
            </label>
            <select
              id="coupon-type"
              value={type}
              onChange={(e) => setType(e.target.value as CouponType)}
              className={inputClass}
            >
              <option value="percent">{t("typePercent")}</option>
              <option value="fixed">{t("typeFixed")}</option>
            </select>
          </div>
          {type === "percent" ? (
            <div>
              <label className="mb-2 block text-sm text-muted" htmlFor="coupon-percent">
                {t("percentValue")}
              </label>
              <input
                id="coupon-percent"
                type="number"
                min={1}
                max={100}
                value={percentValue}
                onChange={(e) => setPercentValue(e.target.value)}
                className={inputClass}
              />
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm text-muted" htmlFor="coupon-fixed">
                {t("fixedValue")}
              </label>
              <FeeInput id="coupon-fixed" cents={fixedCents} onChange={setFixedCents} />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="coupon-max-uses">
              {t("maxUses")}{" "}
              <span className="text-muted/70">({t("optional")})</span>
            </label>
            <input
              id="coupon-max-uses"
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder={t("unlimited")}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="coupon-max-per-user">
              {t("maxUsesPerUser")}{" "}
              <span className="text-muted/70">({t("optional")})</span>
            </label>
            <input
              id="coupon-max-per-user"
              type="number"
              min={1}
              value={maxUsesPerUser}
              onChange={(e) => setMaxUsesPerUser(e.target.value)}
              placeholder={t("unlimited")}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="coupon-starts">
              {t("startsAt")}{" "}
              <span className="text-muted/70">({t("optional")})</span>
            </label>
            <DateTimePicker
              id="coupon-starts"
              value={startsAt}
              onChange={setStartsAt}
              placeholder={t("pickDateTime")}
              clearLabel={t("clearDate")}
              doneLabel={t("doneDate")}
              timeLabel={t("time")}
              defaultTime="00:00"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="coupon-ends">
              {t("endsAt")}{" "}
              <span className="text-muted/70">({t("optional")})</span>
            </label>
            <DateTimePicker
              id="coupon-ends"
              value={endsAt}
              onChange={setEndsAt}
              placeholder={t("pickDateTime")}
              clearLabel={t("clearDate")}
              doneLabel={t("doneDate")}
              timeLabel={t("time")}
              defaultTime="23:59"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={hasMinSubtotal}
                onChange={(e) => setHasMinSubtotal(e.target.checked)}
                className="rounded border-white/20"
              />
              {t("minSubtotal")}
            </label>
            {hasMinSubtotal ? (
              <div className="mt-2 max-w-xs">
                <FeeInput
                  id="coupon-min-subtotal"
                  cents={minSubtotalCents}
                  onChange={setMinSubtotalCents}
                />
              </div>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          disabled={createCoupon.isPending || !code.trim()}
          onClick={submit}
          className="rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {createCoupon.isPending ? t("creating") : t("create")}
        </button>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("listTitle")}
        </h2>
        {couponsQuery.isLoading ? (
          <div className="mt-4">
            <ListRowsSkeleton rows={3} />
          </div>
        ) : null}
        {couponsQuery.isError ? (
          <p className="mt-4 text-sm text-red-300">{t("unableToLoad")}</p>
        ) : null}
        {!couponsQuery.isLoading && (couponsQuery.data?.length ?? 0) === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("empty")}</p>
        ) : null}
        {(couponsQuery.data?.length ?? 0) > 0 ? (
          <ul className="mt-4">
            {couponsQuery.data?.map((coupon) => (
              <CouponRow key={coupon.id} coupon={coupon} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
