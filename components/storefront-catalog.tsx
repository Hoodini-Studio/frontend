"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePublishedProducts } from "@/hooks/use-products";
import { formatEuroFromCents } from "@/lib/money";

export function StorefrontCatalog() {
  const t = useTranslations("store");
  const tCommon = useTranslations("common");
  const { data, isLoading, isError } = usePublishedProducts();
  const products = data?.data ?? [];

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12 sm:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">{t("eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {tCommon("brand")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{t("subtitle")}</p>
      </header>

      {isLoading ? <p className="text-sm text-muted">{tCommon("loading")}</p> : null}

      {isError ? (
        <p className="text-sm text-red-300">{t("unableToLoad")}</p>
      ) : null}

      {!isLoading && !isError && products.length === 0 ? (
        <div className="max-w-md">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {t("emptyTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {t("emptyMessage")}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && products.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                className="group block outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02]">
                  {product.primary_image_url ? (
                    <Image
                      src={product.primary_image_url}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-lg font-semibold text-foreground transition group-hover:opacity-80">
                    {product.name}
                  </h2>
                  <p className="shrink-0 text-sm text-muted">
                    {formatEuroFromCents(product.price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
