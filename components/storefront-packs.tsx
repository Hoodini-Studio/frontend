"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowMark } from "@/components/brand/arrow-mark";
import { Reveal } from "@/components/ui/reveal";
import { useHomeLayer } from "@/hooks/use-home-layer";
import { useHomepageCopy } from "@/hooks/use-homepage-copy";
import { usePublishedBundles } from "@/hooks/use-bundles";
import { formatEuroFromCents } from "@/lib/money";
import { pageShellClass } from "@/lib/layout";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import type { Bundle } from "@/types/bundle";

const HOME_PACK_LIMIT = 6;
const PREVIEW_MAX = 3;

function PackItemPreview({ pack }: { pack: Bundle }) {
  const tHome = useTranslations("home");
  const items = (pack.items ?? []).filter((item) => item.product);
  const visible = items.slice(0, PREVIEW_MAX);
  const remaining = Math.max(0, items.length - visible.length);

  if (visible.length === 0) {
    return null;
  }

  return (
    <ul className="mt-6 flex flex-wrap items-center gap-2">
      {visible.map((item) => {
        const product = item.product!;

        return (
          <li
            key={item.id}
            className="relative h-16 w-14 overflow-hidden border border-border bg-charcoal sm:h-20 sm:w-16"
            title={product.name}
          >
            {product.primary_image_url ? (
              <Image
                src={product.primary_image_url}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <span className="flex h-full items-center justify-center px-1 text-center text-[9px] uppercase tracking-wide text-muted">
                {product.name}
              </span>
            )}
          </li>
        );
      })}
      {remaining > 0 ? (
        <li className="flex h-16 w-14 items-center justify-center border border-border bg-background text-[10px] font-medium uppercase tracking-[0.12em] text-foreground sm:h-20 sm:w-16">
          {tHome("packMoreItems", { count: remaining })}
        </li>
      ) : null}
    </ul>
  );
}

export function StorefrontPacks() {
  const t = useTranslations("store");
  const tHome = useTranslations("home");
  const copy = useHomepageCopy();
  const [layerRef, layer] = useHomeLayer({ z: 2, pin: "never" });
  const { data, isLoading, isError } = usePublishedBundles({
    perPage: HOME_PACK_LIMIT,
  });
  const packs = data?.data ?? [];

  if (isError || (!isLoading && packs.length === 0)) {
    return null;
  }

  return (
    <section
      id="packs"
      ref={layerRef}
      data-stack={layer["data-stack"]}
      style={layer.style}
      aria-labelledby="storefront-packs-heading"
      className={`${layer.className} anchor-scroll border-b border-border`}
    >
      <div className={pageShellClass("shell", "py-16 sm:py-20")}>
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                {copy.packsEyebrow}
              </p>
              <h2
                id="storefront-packs-heading"
                className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              >
                {copy.packsTitle}
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted">{copy.packsSubtitle}</p>
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="mt-10">
            <ProductGridSkeleton count={2} />
          </div>
        ) : null}

        {packs.length > 0 ? (
          <ul className="mt-10 space-y-6">
            {packs.map((pack, index) => {
              const itemCount = pack.item_count ?? pack.items?.length ?? 0;
              const showSuggested =
                pack.suggested_price_cents != null &&
                pack.suggested_price_cents > pack.price;
              const reverse = index % 2 === 1;

              return (
                <li key={pack.id}>
                  <Reveal delayMs={index * 80}>
                    <Link
                      href={`/packs/${pack.slug}`}
                      className={`group grid gap-0 overflow-hidden border border-border bg-surface outline-none transition hover:border-border-strong focus-visible:ring-2 focus-visible:ring-foreground/30 lg:grid-cols-2 ${
                        reverse ? "lg:[&>*:first-child]:order-2" : ""
                      }`}
                    >
                      <div className="relative aspect-4/5 bg-charcoal lg:aspect-auto lg:min-h-[22rem]">
                        {pack.primary_image_url ? (
                          <Image
                            src={pack.primary_image_url}
                            alt={pack.name}
                            fill
                            unoptimized
                            loading={index < 2 ? "eager" : "lazy"}
                            className="object-cover transition duration-500 group-hover:scale-[1.02]"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        ) : null}
                        <span className="absolute left-4 top-4 border border-foreground/50 bg-background/50 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
                          {tHome("packBadge")}
                        </span>
                      </div>
                      <div className="flex flex-col justify-end px-6 py-8 sm:px-10 sm:py-12">
                        {itemCount > 0 ? (
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                            {t("packItemCount", { count: itemCount })}
                          </p>
                        ) : null}
                        <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                          {pack.name}
                        </h3>
                        <div className="mt-4 flex flex-wrap items-baseline gap-3">
                          <p className="text-lg text-foreground">
                            {formatEuroFromCents(pack.price)}
                          </p>
                          {showSuggested ? (
                            <p className="text-sm text-muted line-through">
                              {formatEuroFromCents(pack.suggested_price_cents!)}
                            </p>
                          ) : null}
                        </div>
                        <PackItemPreview pack={pack} />
                        <span className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition group-hover:text-foreground">
                          {tHome("packExplore")}
                          <ArrowMark className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
