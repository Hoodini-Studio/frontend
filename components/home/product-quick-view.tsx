"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { ProductCatalogOptions } from "@/components/product-catalog-options";
import { useAddCartItemMutation } from "@/hooks/use-commerce";
import { normalizeLocale } from "@/lib/i18n/config";
import { formatEuroFromCents } from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { Product } from "@/types/product";

type ProductQuickViewProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

function initialColorId(product: Product) {
  const colors = product.colors ?? [];
  return colors.length === 1 ? colors[0].id : null;
}

function initialSizeId(product: Product) {
  const sizes = product.sizes ?? [];
  return sizes.length === 1 ? sizes[0].id : null;
}

function QuickViewDialog({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const t = useTranslations("store");
  const tHome = useTranslations("home");
  const locale = normalizeLocale(useLocale());
  const { toast } = useToast();
  const titleId = useId();
  const addToCart = useAddCartItemMutation();
  const [colorId, setColorId] = useState(() => initialColorId(product));
  const [sizeId, setSizeId] = useState(() => initialSizeId(product));
  const [missing, setMissing] = useState<"color" | "size" | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const imageUrl =
    product.primary_image_url ??
    product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url ??
    null;

  const handleAdd = () => {
    const colors = product.colors ?? [];
    const sizes = product.sizes ?? [];

    if (colors.length > 0 && !colorId) {
      setMissing("color");
      return;
    }

    if (sizes.length > 0 && !sizeId) {
      setMissing("size");
      return;
    }

    setMissing(null);
    void addToCart
      .mutateAsync({
        product_id: product.id,
        quantity: 1,
        color_id: colorId,
        size_id: sizeId,
      })
      .then(() => {
        toast(t("addedToCart"));
        onClose();
      })
      .catch(() => toast(t("unableToAddToCart"), { variant: "error" }));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label={tHome("quickViewClose")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto border border-border bg-surface-elevated sm:max-w-3xl sm:rounded-none"
      >
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-4/5 bg-surface">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            ) : null}
          </div>
          <div className="flex flex-col px-6 py-6 sm:px-8 sm:py-8">
            <button
              type="button"
              onClick={onClose}
              className="self-end text-xs uppercase tracking-[0.18em] text-muted transition hover:text-foreground"
            >
              {tHome("quickViewClose")}
            </button>
            <h2
              id={titleId}
              className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground"
            >
              {product.name}
            </h2>
            <p className="mt-2 text-lg text-foreground">
              {formatEuroFromCents(product.price)}
            </p>

            <div className="mt-6">
              <ProductCatalogOptions
                product={product}
                locale={locale}
                categoryLabel={t("categoryLabel")}
                genderLabel={t("genderLabel")}
                colorLabel={t("colorLabel")}
                sizeLabel={t("sizeLabel")}
                selectable
                selectedColorId={colorId}
                selectedSizeId={sizeId}
                onSelectColor={(id) => {
                  setColorId(id);
                  setMissing(null);
                }}
                onSelectSize={(id) => {
                  setSizeId(id);
                  setMissing(null);
                }}
                emphasizeColor={missing === "color"}
                emphasizeSize={missing === "size"}
              />
            </div>

            {missing ? (
              <p className="mt-4 text-sm text-foreground" role="status">
                {t("selectOneOption", {
                  option: missing === "color" ? t("colorLabel") : t("sizeLabel"),
                })}
              </p>
            ) : null}

            <button
              type="button"
              disabled={addToCart.isPending}
              onClick={handleAdd}
              className="mt-8 w-full bg-foreground px-5 py-3.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {addToCart.isPending ? t("addingToCart") : t("addToCart")}
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-muted transition hover:text-foreground"
              onClick={onClose}
            >
              {tHome("quickViewDetails")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductQuickView({ product, open, onClose }: ProductQuickViewProps) {
  if (!open || !product) {
    return null;
  }

  return <QuickViewDialog key={product.id} product={product} onClose={onClose} />;
}
