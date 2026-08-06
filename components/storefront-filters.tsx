"use client";

import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localizedName } from "@/lib/i18n/localized";
import { normalizeLocale } from "@/lib/i18n/config";
import {
  appendPriceDigit,
  formatPriceEntry,
  removePriceDigit,
} from "@/lib/money";
import type {
  CatalogCategory,
  CatalogColor,
  CatalogGender,
  CatalogSize,
} from "@/types/catalog";
import type { StorefrontFilterState } from "@/hooks/use-storefront-filters";

type FacetKey = "category" | "color" | "size" | "gender";

type StorefrontFiltersProps = {
  filters: StorefrontFilterState;
  categories: CatalogCategory[];
  colors: CatalogColor[];
  sizes: CatalogSize[];
  genders: CatalogGender[];
  onToggle: (facet: FacetKey, slug: string) => void;
  onPriceChange: (priceMin: number | null, priceMax: number | null) => void;
  onClear: () => void;
  activeCount: number;
  className?: string;
  showHeader?: boolean;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.22em] text-muted">{children}</p>
  );
}

type PriceCentsInputProps = {
  id: string;
  value: number | null;
  onChange: (cents: number | null) => void;
  onCommit: () => void;
  placeholder?: string;
};

function PriceCentsInput({
  id,
  value,
  onChange,
  onCommit,
  placeholder = "00.00",
}: PriceCentsInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onCommit();
      return;
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      const next = removePriceDigit(value ?? 0);
      onChange(next === 0 ? null : next);
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
      const next = removePriceDigit(value ?? 0);
      onChange(next === 0 ? null : next);
      return;
    }

    if (data == null) {
      return;
    }

    event.preventDefault();

    if (/^\d$/.test(data)) {
      onChange(appendPriceDigit(value ?? 0, Number(data)));
    }
  };

  return (
    <div className="relative min-w-0">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value !== null ? formatPriceEntry(value) : ""}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onChange={() => {}}
        onBlur={onCommit}
        className="w-full min-w-0 border border-white/15 bg-transparent px-3 py-2 pr-8 font-mono text-sm tracking-wide text-foreground outline-none transition placeholder:text-muted/50 focus:border-white/40"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
        €
      </span>
    </div>
  );
}

export function StorefrontFilters({
  filters,
  categories,
  colors,
  sizes,
  genders,
  onToggle,
  onPriceChange,
  onClear,
  activeCount,
  className = "",
  showHeader = true,
}: StorefrontFiltersProps) {
  const t = useTranslations("store");
  const locale = normalizeLocale(useLocale());
  const [priceMinCents, setPriceMinCents] = useState<number | null>(filters.priceMin);
  const [priceMaxCents, setPriceMaxCents] = useState<number | null>(filters.priceMax);
  const [priceSyncedFrom, setPriceSyncedFrom] = useState(
    `${filters.priceMin ?? ""}:${filters.priceMax ?? ""}`,
  );
  const priceExternalKey = `${filters.priceMin ?? ""}:${filters.priceMax ?? ""}`;

  if (priceExternalKey !== priceSyncedFrom) {
    setPriceSyncedFrom(priceExternalKey);
    setPriceMinCents(filters.priceMin);
    setPriceMaxCents(filters.priceMax);
  }

  const applyPriceRange = () => {
    onPriceChange(priceMinCents, priceMaxCents);
  };

  return (
    <div className={[className, !/\bgrid\b/.test(className) ? "space-y-8" : ""].filter(Boolean).join(" ")}>
      {showHeader ? (
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("filtersTitle")}
          </h2>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="text-xs uppercase tracking-[0.18em] text-muted transition hover:text-foreground"
            >
              {t("clearAll")}
            </button>
          ) : null}
        </div>
      ) : null}

      {categories.length > 0 ? (
        <section className="space-y-3">
          <SectionLabel>{t("categoryLabel")}</SectionLabel>
          <ul className="space-y-1">
            {categories.map((category) => {
              const active = filters.category.includes(category.slug);
              const label = localizedName(category, locale);

              return (
                <li key={category.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onToggle("category", category.slug)}
                    className={`block w-full py-1.5 text-left text-sm transition ${
                      active
                        ? "text-foreground underline decoration-white/40 underline-offset-4"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {genders.length > 0 ? (
        <section className="space-y-3">
          <SectionLabel>{t("genderLabel")}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {genders.map((gender) => {
              const active = filters.gender.includes(gender.slug);
              const label = localizedName(gender, locale);

              return (
                <button
                  key={gender.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggle("gender", gender.slug)}
                  className={`border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-white/50 text-foreground"
                      : "border-white/15 text-muted hover:border-white/30 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {colors.length > 0 ? (
        <section className="space-y-3">
          <SectionLabel>{t("colorLabel")}</SectionLabel>
          <ul className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const active = filters.color.includes(color.slug);
              const label = localizedName(color, locale);

              return (
                <li key={color.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={label}
                    title={label}
                    onClick={() => onToggle("color", color.slug)}
                    className={`group flex flex-col items-center gap-2 transition ${
                      active ? "opacity-100" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span
                      className={`h-8 w-8 rounded-full border transition ${
                        active
                          ? "border-white scale-110"
                          : "border-white/25 group-hover:border-white/50"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span
                      className={`max-w-16 truncate text-[11px] ${
                        active ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {sizes.length > 0 ? (
        <section className="space-y-3">
          <SectionLabel>{t("sizeLabel")}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = filters.size.includes(size.slug);

              return (
                <button
                  key={size.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggle("size", size.slug)}
                  className={`min-w-11 border px-2.5 py-1.5 text-center text-sm transition ${
                    active
                      ? "border-white/50 text-foreground"
                      : "border-white/15 text-muted hover:border-white/30 hover:text-foreground"
                  }`}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionLabel>{t("priceLabel")}</SectionLabel>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-x-3 gap-y-1.5">
          <label htmlFor="price-min" className="text-xs text-muted">
            {t("priceMin")}
          </label>
          <span aria-hidden="true" />
          <label htmlFor="price-max" className="text-xs text-muted">
            {t("priceMax")}
          </label>
          <PriceCentsInput
            id="price-min"
            value={priceMinCents}
            onChange={setPriceMinCents}
            onCommit={applyPriceRange}
          />
          <span className="pb-2 text-muted">–</span>
          <PriceCentsInput
            id="price-max"
            value={priceMaxCents}
            onChange={setPriceMaxCents}
            onCommit={applyPriceRange}
          />
        </div>
      </section>
    </div>
  );
}
