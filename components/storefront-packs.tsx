"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePublishedBundles } from "@/hooks/use-bundles";
import { formatEuroFromCents } from "@/lib/money";
import { pageShellClass } from "@/lib/layout";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

const HOME_PACK_LIMIT = 12;

export function StorefrontPacks() {
  const t = useTranslations("store");
  const { data, isLoading, isError } = usePublishedBundles({ perPage: HOME_PACK_LIMIT });
  const packs = data?.data ?? [];

  if (isError || (!isLoading && packs.length === 0)) {
    return null;
  }

  return (
    <section
      aria-labelledby="storefront-packs-heading"
      className={pageShellClass("shell", "pt-12 sm:pt-16")}
    >
      <h2
        id="storefront-packs-heading"
        className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        {t("packsTitle")}
      </h2>

      {isLoading ? <ProductGridSkeleton count={3} /> : null}

      {packs.length > 0 ? (
        <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack, index) => {
            const itemCount = pack.item_count ?? pack.items?.length ?? 0;
            const showSuggested =
              pack.suggested_price_cents != null && pack.suggested_price_cents > pack.price;

            return (
              <li key={pack.id}>
                <Link
                  href={`/packs/${pack.slug}`}
                  className="group block outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-linear-to-b from-white/7 to-white/2">
                    {pack.primary_image_url ? (
                      <Image
                        src={pack.primary_image_url}
                        alt={pack.name}
                        fill
                        unoptimized
                        loading={index < 3 ? "eager" : "lazy"}
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : null}
                    {itemCount > 0 ? (
                      <span className="absolute bottom-3 right-3 bg-black/55 px-2 py-1 text-xs text-foreground backdrop-blur-sm">
                        {t("packItemCount", { count: itemCount })}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-lg font-semibold text-foreground transition group-hover:opacity-80">
                      {pack.name}
                    </h3>
                    <p className="shrink-0 text-sm text-muted">
                      {formatEuroFromCents(pack.price)}
                    </p>
                  </div>
                  {showSuggested ? (
                    <p className="mt-2 text-xs text-muted">
                      {t("packSuggested", {
                        amount: formatEuroFromCents(pack.suggested_price_cents!),
                      })}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
