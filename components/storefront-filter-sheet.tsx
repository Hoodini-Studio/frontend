"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { StorefrontFilters } from "@/components/storefront-filters";
import type { StorefrontFilterState } from "@/hooks/use-storefront-filters";
import type {
  CatalogCategory,
  CatalogColor,
  CatalogGender,
  CatalogSize,
} from "@/types/catalog";

type FacetKey = keyof Omit<StorefrontFilterState, "sort">;

type StorefrontFilterSheetProps = {
  open: boolean;
  onClose: () => void;
  filters: StorefrontFilterState;
  categories: CatalogCategory[];
  colors: CatalogColor[];
  sizes: CatalogSize[];
  genders: CatalogGender[];
  onToggle: (facet: FacetKey, slug: string) => void;
  onClear: () => void;
  activeCount: number;
  resultCount: number;
  mobileOnly?: boolean;
};

const MOBILE_QUERY = "(max-width: 1023px)";

export function StorefrontFilterSheet({
  open,
  onClose,
  filters,
  categories,
  colors,
  sizes,
  genders,
  onToggle,
  onClear,
  activeCount,
  resultCount,
  mobileOnly = false,
}: StorefrontFilterSheetProps) {
  const t = useTranslations("store");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const visible = open && (!mobileOnly || isMobile);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background animate-[fade-in-up_0.35s_ease-out] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="storefront-filters-sheet-title"
    >
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2
          id="storefront-filters-sheet-title"
          className="font-display text-xl font-semibold text-foreground"
        >
          {t("filtersTitle")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-muted transition hover:text-foreground"
        >
          {t("closeFilters")}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <StorefrontFilters
          filters={filters}
          categories={categories}
          colors={colors}
          sizes={sizes}
          genders={genders}
          onToggle={onToggle}
          onClear={onClear}
          activeCount={activeCount}
          showHeader={false}
        />
      </div>

      <footer className="flex items-center gap-3 border-t border-white/10 px-6 py-4">
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-3 text-sm text-muted transition hover:text-foreground"
          >
            {t("clearAll")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex-1 bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 sm:flex-none sm:min-w-48"
        >
          {t("showResults", { count: resultCount })}
        </button>
      </footer>
    </div>
  );
}
