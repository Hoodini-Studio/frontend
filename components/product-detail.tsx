"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { use, useMemo, useState } from "react";
import { usePublishedProduct } from "@/hooks/use-products";
import { formatEuroFromCents } from "@/lib/money";
import { ProductCatalogOptions } from "@/components/product-catalog-options";
import { localizedDescription } from "@/lib/i18n/localized";
import { normalizeLocale } from "@/lib/i18n/config";

type ProductDetailProps = {
  slug: string;
};

export function ProductDetail({ slug }: ProductDetailProps) {
  const t = useTranslations("store");
  const tCommon = useTranslations("common");
  const locale = normalizeLocale(useLocale());
  const { data, isLoading, isError } = usePublishedProduct(slug);
  const product = data?.data;
  const [activeIndex, setActiveIndex] = useState(0);

  const images = product?.images ?? [];

  const resolvedIndex = useMemo(() => {
    if (images.length === 0) {
      return 0;
    }

    return Math.min(Math.max(activeIndex, 0), images.length - 1);
  }, [activeIndex, images.length]);

  const mainImageUrl = images[resolvedIndex]?.url ?? product?.primary_image_url ?? null;
  const canNavigate = images.length > 1;

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="text-sm text-muted transition hover:text-foreground"
      >
        {t("backToShop")}
      </Link>

      <div className="mt-8">
        {isLoading ? <p className="text-sm text-muted">{tCommon("loading")}</p> : null}

        {isError || (!isLoading && !product) ? (
          <div className="max-w-md">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {t("notFoundTitle")}
            </h1>
            <p className="mt-3 text-muted">{t("notFoundMessage")}</p>
            <Link
              href="/"
              className="mt-6 inline-flex text-sm text-foreground underline-offset-4 hover:underline"
            >
              {t("backToShop")}
            </Link>
          </div>
        ) : null}

        {product ? (
          <article className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02]">
                {mainImageUrl ? (
                  <Image
                    src={mainImageUrl}
                    alt={product.name ?? ""}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : null}

                {canNavigate ? (
                  <>
                    <button
                      type="button"
                      onClick={showPrevious}
                      aria-label={t("previousImage")}
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/55 text-foreground backdrop-blur-sm transition hover:bg-black/75"
                    >
                      <span aria-hidden className="text-lg leading-none">
                        ‹
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label={t("nextImage")}
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/55 text-foreground backdrop-blur-sm transition hover:bg-black/75"
                    >
                      <span aria-hidden className="text-lg leading-none">
                        ›
                      </span>
                    </button>
                    <p className="absolute bottom-3 right-3 bg-black/55 px-2 py-1 text-xs text-foreground backdrop-blur-sm">
                      {resolvedIndex + 1} / {images.length}
                    </p>
                  </>
                ) : null}
              </div>

              {canNavigate ? (
                <ul className="grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <li key={image.id}>
                      <button
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={t("imageThumb", { index: index + 1 })}
                        className={`relative aspect-square w-full overflow-hidden outline-none transition ${
                          resolvedIndex === index
                            ? "ring-2 ring-white/40"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="120px"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">{t("productLabel")}</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-xl text-foreground">
                {formatEuroFromCents(product.price)}
              </p>

              <div className="mt-8">
                <ProductCatalogOptions
                  product={product}
                  locale={locale}
                  categoryLabel={t("categoryLabel")}
                  genderLabel={t("genderLabel")}
                  colorLabel={t("colorLabel")}
                  sizeLabel={t("sizeLabel")}
                />
              </div>

              {localizedDescription(product, locale) ? (
                <p className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-muted">
                  {localizedDescription(product, locale)}
                </p>
              ) : (
                <p className="mt-8 text-base text-muted">{t("noDescription")}</p>
              )}
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}

export function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <ProductDetail slug={slug} />;
}
