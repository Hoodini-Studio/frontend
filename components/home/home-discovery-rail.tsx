"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { usePublicCollections } from "@/hooks/use-catalog";
import { useStorefrontFilters } from "@/hooks/use-storefront-filters";
import { pageShellClass } from "@/lib/layout";
import { scrollToTheDrop } from "@/lib/scroll-to-drop";

function hasPublishedProducts(count: number | undefined) {
  return count === undefined || count > 0;
}

function DiscoveryRailContent() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { filters, selectDiscovery } = useStorefrontFilters();
  const collectionsQuery = usePublicCollections();
  const collections = (collectionsQuery.data?.data ?? []).filter(
    (item) => item.is_active !== false && hasPublishedProducts(item.products_count),
  );

  const allActive = filters.collection.length === 0;

  const chip = (active: boolean) =>
    `shrink-0 border-b-2 px-1 pb-2 text-xs font-medium uppercase tracking-[0.16em] transition ${
      active
        ? "border-foreground text-foreground"
        : "border-transparent text-muted hover:text-foreground"
    }`;

  const onSelect = (kind: "all" | "collection", slug?: string) => {
    scrollToTheDrop(() => selectDiscovery(kind, slug));
  };

  return (
    <div className="category-nav-enter sticky top-[4.5rem] z-40 border-b border-border bg-surface/95 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <div
        className={pageShellClass(
          "shell",
          "flex h-12 items-center gap-6 overflow-x-auto scrollbar-none",
        )}
        role="navigation"
        aria-label={tCommon("navShop")}
      >
        <button
          type="button"
          className={chip(allActive)}
          onClick={() => onSelect("all")}
        >
          {t("railAll")}
        </button>
        {collections.map((item) => (
          <button
            key={`c-${item.slug}`}
            type="button"
            className={chip(
              filters.collection.length === 1 && filters.collection[0] === item.slug,
            )}
            onClick={() => onSelect("collection", item.slug)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HomeDiscoveryRail() {
  return (
    <Suspense fallback={null}>
      <DiscoveryRailContent />
    </Suspense>
  );
}
