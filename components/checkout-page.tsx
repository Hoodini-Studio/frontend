"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, type ReactNode } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  useCart,
  useCheckoutQuote,
  usePlaceCheckoutMutation,
  useShippingZones,
} from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { ApiError } from "@/lib/api/client";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import type { CountryCode, PaymentMethod } from "@/types/commerce";
import { CheckoutSkeleton } from "@/components/ui/checkout-skeleton";
import { Spinner } from "@/components/ui/spinner";

type FieldKey =
  | "customer_name"
  | "phone"
  | "email"
  | "country_code"
  | "city"
  | "address_line"
  | "postal_code"
  | "notes"
  | "payment_method";

type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ORDER: FieldKey[] = [
  "customer_name",
  "phone",
  "email",
  "country_code",
  "city",
  "address_line",
  "postal_code",
  "notes",
  "payment_method",
];

const API_FIELD_MAP: Record<string, FieldKey> = {
  customer_name: "customer_name",
  phone: "phone",
  email: "email",
  country_code: "country_code",
  city: "city",
  address_line: "address_line",
  postal_code: "postal_code",
  notes: "notes",
  payment_method: "payment_method",
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function fieldClassName(hasError: boolean): string {
  return `w-full rounded-xl border bg-black/40 px-4 py-3 text-foreground outline-none transition ${
    hasError
      ? "border-red-300/50 focus:border-red-300/70"
      : "border-white/10 focus:border-white/30"
  }`;
}

function FieldLabel({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm text-muted" htmlFor={htmlFor}>
      {children}
      {required ? <span aria-hidden="true"> *</span> : null}
    </label>
  );
}

export function CheckoutPageContent() {
  const t = useTranslations("store");
  const router = useRouter();
  const { translateMessage, translateErrors } = useApiMessageTranslator();
  const { data: user } = useCurrentUser();
  const cartQuery = useCart();
  const zonesQuery = useShippingZones();
  const placeOrder = usePlaceCheckoutMutation();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode | "">("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [prefilledFromUserId, setPrefilledFromUserId] = useState<string | null>(null);

  if (user && user.id !== prefilledFromUserId) {
    setPrefilledFromUserId(user.id);
    setCustomerName(user.name ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setCountryCode(user.shipping_country_code ?? "");
    setCity(user.shipping_city ?? "");
    setAddressLine(user.shipping_address_line ?? "");
    setPostalCode(user.shipping_postal_code ?? "");
  }

  const quoteQuery = useCheckoutQuote(
    countryCode || null,
    Boolean(countryCode) && (cartQuery.data?.item_count ?? 0) > 0,
  );

  const cart = cartQuery.data;
  const zones = zonesQuery.data ?? [];
  const isLoggedIn = Boolean(user);
  const accountEmail = user?.email ?? "";

  const clearFieldError = (field: FieldKey) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const focusFirstError = (errors: FieldErrors) => {
    const first = FIELD_ORDER.find((field) => errors[field]);
    if (!first || !formRef.current) {
      return;
    }

    const el = formRef.current.querySelector<HTMLElement>(`#${first}`);
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!customerName.trim()) {
      next.customer_name = t("checkoutNameRequired");
    }
    if (!phone.trim()) {
      next.phone = t("checkoutPhoneRequired");
    }
    if (!isLoggedIn && email.trim() && !isValidEmail(email.trim())) {
      next.email = t("checkoutEmailInvalid");
    }
    if (!countryCode) {
      next.country_code = t("checkoutCountryRequired");
    }
    if (!city.trim()) {
      next.city = t("checkoutCityRequired");
    }
    if (!addressLine.trim()) {
      next.address_line = t("checkoutAddressRequired");
    }
    if (!postalCode.trim()) {
      next.postal_code = t("checkoutPostalRequired");
    }

    return next;
  };

  const submit = async () => {
    setFormError(null);
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      return;
    }

    try {
      const response = await placeOrder.mutateAsync({
        customer_name: customerName.trim(),
        email: isLoggedIn ? accountEmail || null : email.trim() || null,
        phone: phone.trim(),
        country_code: countryCode as CountryCode,
        city: city.trim(),
        address_line: addressLine.trim(),
        postal_code: postalCode.trim(),
        notes: notes.trim() || null,
        payment_method: paymentMethod,
      });

      router.push(`/checkout/success?number=${encodeURIComponent(response.data.number)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        const localized = translateErrors(err.errors);
        const mapped: FieldErrors = {};

        Object.entries(localized).forEach(([key, messages]) => {
          const field = API_FIELD_MAP[key];
          if (field && messages[0]) {
            mapped[field] = messages[0];
          }
        });

        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          focusFirstError(mapped);
          return;
        }

        setFormError(translateMessage(err.message));
        return;
      }

      setFormError(t("checkoutUnable"));
    }
  };

  if (cartQuery.isLoading) {
    return <CheckoutSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted">{t("cartEmpty")}</p>
        <Link href="/cart" className="text-sm text-foreground underline-offset-4 hover:underline">
          {t("cartTitle")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6" ref={formRef}>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          {t("checkoutTitle")}
        </h1>

        {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="customer_name" required>
              {t("checkoutName")}
            </FieldLabel>
            <input
              id="customer_name"
              value={customerName}
              aria-invalid={Boolean(fieldErrors.customer_name)}
              onChange={(e) => {
                setCustomerName(e.target.value);
                clearFieldError("customer_name");
              }}
              className={fieldClassName(Boolean(fieldErrors.customer_name))}
            />
            {fieldErrors.customer_name ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.customer_name}</p>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="phone" required>
              {t("checkoutPhone")}
            </FieldLabel>
            <input
              id="phone"
              value={phone}
              aria-invalid={Boolean(fieldErrors.phone)}
              onChange={(e) => {
                setPhone(e.target.value);
                clearFieldError("phone");
              }}
              className={fieldClassName(Boolean(fieldErrors.phone))}
            />
            {fieldErrors.phone ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.phone}</p>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="email">{t("checkoutEmail")}</FieldLabel>
            <input
              id="email"
              type="email"
              value={isLoggedIn ? accountEmail : email}
              disabled={isLoggedIn}
              readOnly={isLoggedIn}
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(e) => {
                if (isLoggedIn) {
                  return;
                }
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              className={`${fieldClassName(Boolean(fieldErrors.email))} disabled:cursor-not-allowed disabled:opacity-60`}
            />
            {fieldErrors.email ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="country_code" required>
              {t("checkoutCountry")}
            </FieldLabel>
            <select
              id="country_code"
              value={countryCode}
              aria-invalid={Boolean(fieldErrors.country_code)}
              onChange={(e) => {
                setCountryCode(e.target.value as CountryCode | "");
                clearFieldError("country_code");
              }}
              className={fieldClassName(Boolean(fieldErrors.country_code))}
            >
              <option value="">{t("checkoutCountryPlaceholder")}</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.country_code}>
                  {zone.name_en}
                </option>
              ))}
            </select>
            {fieldErrors.country_code ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.country_code}</p>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="city" required>
              {t("checkoutCity")}
            </FieldLabel>
            <input
              id="city"
              value={city}
              aria-invalid={Boolean(fieldErrors.city)}
              onChange={(e) => {
                setCity(e.target.value);
                clearFieldError("city");
              }}
              className={fieldClassName(Boolean(fieldErrors.city))}
            />
            {fieldErrors.city ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.city}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="address_line" required>
              {t("checkoutAddress")}
            </FieldLabel>
            <input
              id="address_line"
              value={addressLine}
              aria-invalid={Boolean(fieldErrors.address_line)}
              onChange={(e) => {
                setAddressLine(e.target.value);
                clearFieldError("address_line");
              }}
              className={fieldClassName(Boolean(fieldErrors.address_line))}
            />
            {fieldErrors.address_line ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.address_line}</p>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="postal_code" required>
              {t("checkoutPostal")}
            </FieldLabel>
            <input
              id="postal_code"
              value={postalCode}
              aria-invalid={Boolean(fieldErrors.postal_code)}
              onChange={(e) => {
                setPostalCode(e.target.value);
                clearFieldError("postal_code");
              }}
              className={fieldClassName(Boolean(fieldErrors.postal_code))}
            />
            {fieldErrors.postal_code ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.postal_code}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="notes">{t("checkoutNotes")}</FieldLabel>
            <textarea
              id="notes"
              value={notes}
              rows={3}
              aria-invalid={Boolean(fieldErrors.notes)}
              onChange={(e) => {
                setNotes(e.target.value);
                clearFieldError("notes");
              }}
              className={fieldClassName(Boolean(fieldErrors.notes))}
            />
            {fieldErrors.notes ? (
              <p className="mt-2 text-sm text-red-300">{fieldErrors.notes}</p>
            ) : null}
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm text-muted">{t("checkoutPayment")} *</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-4 transition ${
                paymentMethod === "cash"
                  ? "border-white/40 bg-white/10 text-foreground"
                  : "border-white/10 text-foreground hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name="payment"
                className="sr-only"
                checked={paymentMethod === "cash"}
                onChange={() => {
                  setPaymentMethod("cash");
                  clearFieldError("payment_method");
                }}
              />
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{t("checkoutCash")}</span>
                <span
                  aria-hidden
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    paymentMethod === "cash"
                      ? "border-foreground"
                      : "border-white/30"
                  }`}
                >
                  {paymentMethod === "cash" ? (
                    <span className="h-2 w-2 rounded-full bg-foreground" />
                  ) : null}
                </span>
              </span>
              <span className="text-xs text-muted">{t("checkoutCashHint")}</span>
            </label>

            <div
              aria-disabled="true"
              className="relative flex flex-col justify-center gap-1 rounded-xl border border-dashed border-white/10 px-4 py-4 text-muted opacity-55"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{t("checkoutCard")}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  {t("checkoutCardComingSoon")}
                </span>
              </span>
            </div>
          </div>
          {fieldErrors.payment_method ? (
            <p className="text-sm text-red-300">{fieldErrors.payment_method}</p>
          ) : null}
        </fieldset>

        <button
          type="button"
          disabled={placeOrder.isPending}
          onClick={() => void submit()}
          className="rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {placeOrder.isPending ? t("checkoutPlacing") : t("checkoutPlaceOrder")}
        </button>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/3 p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("checkoutSummary")}
        </h2>
        <ul className="space-y-2 text-sm text-muted">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatEuroFromCents(item.line_total_cents)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>{t("cartSubtotal")}</span>
            <span>{formatEuroFromCents(quoteQuery.data?.subtotal_cents ?? cart.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{t("checkoutShipping")}</span>
            <span>
              {quoteQuery.isFetching ? (
                <Spinner size="sm" />
              ) : (
                formatEuroFromCents(quoteQuery.data?.shipping_cents ?? 0)
              )}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium text-foreground">
            <span>{t("checkoutTotal")}</span>
            <span>
              {formatEuroFromCents(
                quoteQuery.data?.total_cents ?? cart.subtotal_cents,
              )}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
