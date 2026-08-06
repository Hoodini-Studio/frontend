"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localizedName } from "@/lib/i18n/localized";
import { normalizeLocale } from "@/lib/i18n/config";
import type {
  CatalogCategory,
  CatalogColor,
  CatalogGender,
  CatalogSize,
} from "@/types/catalog";
import type { StorefrontFilterState } from "@/hooks/use-storefront-filters";

type FacetKey = keyof Omit<StorefrontFilterState, "sort">;

type StorefrontFiltersProps = {
  filters: StorefrontFilterState;
  categories: CatalogCategory[];
  colors: CatalogColor[];
  sizes: CatalogSize[];
  genders: CatalogGender[];
  onToggle: (facet: FacetKey, slug: string) => void;
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

export function StorefrontFilters({
  filters,
  categories,
  colors,
  sizes,
  genders,
  onToggle,
  onClear,
  activeCount,
  className = "",
  showHeader = true,
}: StorefrontFiltersProps) {
  const t = useTranslations("store");
  const locale = normalizeLocale(useLocale());

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
    </div>
  );
}
