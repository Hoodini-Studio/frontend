"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { formatEuroFromCents } from "@/lib/money";
import type { Product } from "@/types/product";

type ProductPreviewModalProps = {
  product: Product | null;
  onClose: () => void;
};

export function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
  const t = useTranslations("adminProducts");
  const tStore = useTranslations("store");
  const images = product?.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!product) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (images.length <= 1) {
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % images.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose, images.length]);

  if (!product) {
    return null;
  }

  const activeImage = images[activeIndex] ?? null;
  const imageUrl = activeImage?.url ?? product.primary_image_url;
  const isPublished = product.status === "published";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 sm:px-6">
      <button
        type="button"
        aria-label={t("closePreview")}
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-preview-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto border border-white/10 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
            {t("previewLabel")}
          </p>
          <p className="mt-1 text-sm text-muted">
            {isPublished ? t("previewPublishedHint") : t("previewDraftHint")}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 512px"
              />
            ) : null}

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label={tStore("previousImage")}
                  onClick={() =>
                    setActiveIndex((current) => (current - 1 + images.length) % images.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/55 px-3 py-2 text-sm text-foreground transition hover:bg-black/75"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={tStore("nextImage")}
                  onClick={() =>
                    setActiveIndex((current) => (current + 1) % images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/55 px-3 py-2 text-sm text-foreground transition hover:bg-black/75"
                >
                  →
                </button>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={tStore("imageThumb", { index: index + 1 })}
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-14 w-11 shrink-0 overflow-hidden ${
                    index === activeIndex ? "ring-1 ring-white/50" : "opacity-60"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="44px"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex items-baseline justify-between gap-4">
            <h2
              id="product-preview-title"
              className="font-display text-xl font-semibold text-foreground sm:text-2xl"
            >
              {product.name}
            </h2>
            <p className="shrink-0 text-sm text-muted">
              {formatEuroFromCents(product.price)}
            </p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            {product.description?.trim()
              ? product.description
              : tStore("noDescription")}
          </p>

          <p className="mt-4 text-xs text-muted">
            <span
              className={
                isPublished ? "text-emerald-300" : "text-amber-200"
              }
            >
              {isPublished ? t("statusPublished") : t("statusDraft")}
            </span>
            <span className="mx-2 text-white/20">·</span>
            {product.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:border-white/30 hover:bg-white/5"
          >
            {t("closePreview")}
          </button>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            {t("edit")}
          </Link>
        </div>
      </div>
    </div>
  );
}
