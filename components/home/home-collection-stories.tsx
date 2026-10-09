"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useHomeLayer } from "@/hooks/use-home-layer";
import { useHomepageCopy } from "@/hooks/use-homepage-copy";
import { usePublicCollections } from "@/hooks/use-catalog";
import { useStorefrontFilters } from "@/hooks/use-storefront-filters";
import { Reveal } from "@/components/ui/reveal";
import { pageShellClass } from "@/lib/layout";
import { scrollToTheDrop } from "@/lib/scroll-to-drop";
import { useTranslations } from "next-intl";

/** Local cover art per collection slug (showcase imagery). */
const COLLECTION_COVERS: Record<string, string> = {
  anime: "/images/collections/anime.jpg",
  "studio-basics": "/images/collections/studio-basics.jpg",
  new: "/images/collections/new.jpg",
  "after-hours": "/images/collections/after-hours.jpg",
  "forest-capsule": "/images/collections/forest-capsule.jpg",
};

function hasPublishedProducts(count: number | undefined) {
  return count === undefined || count > 0;
}

function CollectionStoriesContent() {
  const t = useTranslations("home");
  const copy = useHomepageCopy();
  const [layerRef, layer] = useHomeLayer({ z: 4, pin: "never" });
  const { data, isLoading } = usePublicCollections();
  const { selectDiscovery } = useStorefrontFilters();
  const collections = (data?.data ?? [])
    .filter(
      (item) =>
        item.is_active !== false && hasPublishedProducts(item.products_count),
    )
    .slice(0, 6);

  if (!isLoading && collections.length === 0) {
    return <div id="collections" className="h-0 overflow-hidden" aria-hidden="true" />;
  }

  const select = (slug: string) => {
    // Scroll first while Drop still has full catalog height, then filter.
    scrollToTheDrop(() => selectDiscovery("collection", slug));
  };

  return (
    <section
      id="collections"
      ref={layerRef}
      data-stack={layer["data-stack"]}
      style={layer.style}
      aria-labelledby="home-collections-heading"
      className={`${layer.className} anchor-scroll border-b border-border`}
    >
      <div className={pageShellClass("shell", "py-16 sm:py-20")}>
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="home-collections-heading"
                className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              >
                {copy.collectionsTitle}
              </h2>
              <p className="mt-2 text-sm text-muted">{copy.collectionsSubtitle}</p>
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-48 animate-pulse border border-border bg-surface sm:h-64"
              />
            ))}
          </ul>
        ) : (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, index) => {
              const cover = COLLECTION_COVERS[collection.slug];

              return (
                <li key={collection.slug}>
                  <Reveal delayMs={index * 90}>
                    <button
                      type="button"
                      onClick={() => select(collection.slug)}
                      className="group relative flex h-56 w-full flex-col justify-end overflow-hidden border border-border bg-surface text-left transition hover:border-border-strong sm:h-72"
                    >
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_20%,rgba(240,238,232,0.08),transparent_55%)]"
                        />
                      )}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-transparent"
                      />
                      <div className="relative px-6 py-6">
                        <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                          {t("collectionsTap")}
                        </span>
                        <span className="mt-2 block font-display text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
                          {collection.name}
                        </span>
                      </div>
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export function HomeCollectionStories() {
  return (
    <Suspense fallback={null}>
      <CollectionStoriesContent />
    </Suspense>
  );
}
