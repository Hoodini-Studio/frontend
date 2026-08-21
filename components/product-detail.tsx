"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { use, useMemo, useRef, useState } from "react";
import { usePublishedProduct } from "@/hooks/use-products";
import { useAddCartItemMutation } from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { ProductCatalogOptions } from "@/components/product-catalog-options";
import { localizedDescription } from "@/lib/i18n/localized";
import { normalizeLocale } from "@/lib/i18n/config";
import { useToast } from "@/providers/toast-provider";
import { ProductDetailSkeleton } from "@/components/ui/product-detail-skeleton";

type ProductDetailProps = {
  slug: string;
};

export function ProductDetail({ slug }: ProductDetailProps) {
  const t = useTranslations("store");
  const locale = normalizeLocale(useLocale());
  const { toast } = useToast();
  const { data, isLoading, isError } = usePublishedProduct(slug);
  const product = data?.data;
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [needsColor, setNeedsColor] = useState(false);
  const [needsSize, setNeedsSize] = useState(false);
  const [optionsSyncedFor, setOptionsSyncedFor] = useState<string | null>(null);
  const colorSectionRef = useRef<HTMLDivElement | null>(null);
  const sizeSectionRef = useRef<HTMLDivElement | null>(null);
  const addToCart = useAddCartItemMutation();

  const images = product?.images ?? [];
  const colors = product?.colors ?? [];
  const sizes = product?.sizes ?? [];

  if (product && product.id !== optionsSyncedFor) {
    setOptionsSyncedFor(product.id);
    setSelectedColorId(colors.length === 1 ? colors[0].id : null);
    setSelectedSizeId(sizes.length === 1 ? sizes[0].id : null);
    setNeedsColor(false);
    setNeedsSize(false);
  }

  const resolvedIndex = useMemo(() => {
    if (images.length === 0) {
      return 0;
    }

    return Math.min(Math.max(activeIndex, 0), images.length - 1);
  }, [activeIndex, images.length]);

  const mainImageUrl = images[resolvedIndex]?.url ?? product?.primary_image_url ?? null;
  const canNavigate = images.length > 1;
  const selectionIncomplete = needsColor || needsSize;

  const guidanceMessage = (() => {
    const missing = [
      needsColor ? t("colorLabel") : null,
      needsSize ? t("sizeLabel") : null,
    ].filter((label): label is string => Boolean(label));

    if (missing.length === 0) {
      return null;
    }

    if (missing.length === 1) {
      return t("selectOneOption", { option: missing[0] });
    }

    return t("selectMultipleOptions", { options: missing.join(", ") });
  })();

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const missingColor = colors.length > 0 && !selectedColorId;
    const missingSize = sizes.length > 0 && !selectedSizeId;

    if (missingColor || missingSize) {
      setNeedsColor(missingColor);
      setNeedsSize(missingSize);

      const target = missingColor
        ? colorSectionRef.current
        : sizeSectionRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    setNeedsColor(false);
    setNeedsSize(false);
    void addToCart
      .mutateAsync({
        product_id: product.id,
        quantity: 1,
        color_id: selectedColorId,
        size_id: selectedSizeId,
      })
      .then(() => toast(t("addedToCart")))
      .catch(() => toast(t("unableToAddToCart"), { variant: "error" }));
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
        {isLoading ? <ProductDetailSkeleton /> : null}

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
              <div className="relative aspect-4/5 overflow-hidden bg-linear-to-b from-white/7 to-white/2">
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
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label={t("nextImage")}
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/55 text-foreground backdrop-blur-sm transition hover:bg-black/75"
                    >
                      ›
                    </button>
                  </>
                ) : null}
              </div>

              {images.length > 1 ? (
                <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {images.map((image, index) => (
                    <li key={image.id}>
                      <button
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={t("viewImage", { index: index + 1 })}
                        className={`relative aspect-square overflow-hidden border transition ${
                          index === resolvedIndex
                            ? "border-white/40"
                            : "border-white/10 hover:border-white/25"
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
                  selectable
                  selectedColorId={selectedColorId}
                  selectedSizeId={selectedSizeId}
                  emphasizeColor={needsColor}
                  emphasizeSize={needsSize}
                  colorSectionRef={colorSectionRef}
                  sizeSectionRef={sizeSectionRef}
                  onSelectColor={(id) => {
                    setSelectedColorId(id);
                    setNeedsColor(false);
                    if (selectionIncomplete && sizes.length > 0 && !selectedSizeId) {
                      setNeedsSize(true);
                    }
                  }}
                  onSelectSize={(id) => {
                    setSelectedSizeId(id);
                    setNeedsSize(false);
                    if (selectionIncomplete && colors.length > 0 && !selectedColorId) {
                      setNeedsColor(true);
                    }
                  }}
                />
              </div>

              {guidanceMessage ? (
                <p
                  role="status"
                  className="mt-5 text-sm text-foreground animate-[fade-in-up_0.25s_ease-out]"
                >
                  {guidanceMessage}
                </p>
              ) : null}

              <button
                type="button"
                disabled={addToCart.isPending}
                onClick={handleAddToCart}
                className="mt-8 w-full rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
              >
                {addToCart.isPending ? t("addingToCart") : t("addToCart")}
              </button>

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
