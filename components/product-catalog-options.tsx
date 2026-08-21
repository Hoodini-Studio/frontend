import type { RefObject } from "react";
import type { Product } from "@/types/product";
import type { AppLocale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";

type ProductCatalogOptionsProps = {
  product: Product;
  locale: AppLocale;
  categoryLabel: string;
  genderLabel: string;
  colorLabel: string;
  sizeLabel: string;
  selectedColorId?: string | null;
  selectedSizeId?: string | null;
  onSelectColor?: (id: string) => void;
  onSelectSize?: (id: string) => void;
  selectable?: boolean;
  emphasizeColor?: boolean;
  emphasizeSize?: boolean;
  colorSectionRef?: RefObject<HTMLDivElement | null>;
  sizeSectionRef?: RefObject<HTMLDivElement | null>;
};

export function ProductCatalogOptions({
  product,
  locale,
  categoryLabel,
  genderLabel,
  colorLabel,
  sizeLabel,
  selectedColorId = null,
  selectedSizeId = null,
  onSelectColor,
  onSelectSize,
  selectable = false,
  emphasizeColor = false,
  emphasizeSize = false,
  colorSectionRef,
  sizeSectionRef,
}: ProductCatalogOptionsProps) {
  const categories = product.categories ?? [];
  const genders = product.genders ?? [];
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];

  if (
    categories.length === 0 &&
    genders.length === 0 &&
    colors.length === 0 &&
    sizes.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-5">
      {categories.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {categoryLabel}
          </p>
          <p className="mt-2 text-sm text-foreground">
            {categories.map((item) => localizedName(item, locale)).join(" · ")}
          </p>
        </div>
      ) : null}

      {genders.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {genderLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {genders.map((gender) => (
              <span
                key={gender.id}
                className="border border-white/15 px-3 py-1.5 text-sm text-foreground"
              >
                {localizedName(gender, locale)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {colors.length > 0 ? (
        <div ref={colorSectionRef}>
          <p
            className={`text-xs uppercase tracking-[0.18em] transition ${
              emphasizeColor ? "text-foreground" : "text-muted"
            }`}
          >
            {colorLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color) => {
              const selected = selectedColorId === color.id;
              const className = `inline-flex items-center gap-2 border px-3 py-1.5 text-sm transition ${
                selected
                  ? "border-white/40 bg-white/10 text-foreground"
                  : emphasizeColor
                    ? "border-white/35 text-foreground"
                    : "border-white/15 text-foreground hover:border-white/30"
              }`;

              if (selectable && onSelectColor) {
                return (
                  <button
                    key={color.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectColor(color.id)}
                    className={className}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    {localizedName(color, locale)}
                  </button>
                );
              }

              return (
                <span key={color.id} className={className}>
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  {localizedName(color, locale)}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div ref={sizeSectionRef}>
          <p
            className={`text-xs uppercase tracking-[0.18em] transition ${
              emphasizeSize ? "text-foreground" : "text-muted"
            }`}
          >
            {sizeLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const selected = selectedSizeId === size.id;
              const className = `min-w-10 border px-3 py-1.5 text-center text-sm transition ${
                selected
                  ? "border-white/40 bg-white/10 text-foreground"
                  : emphasizeSize
                    ? "border-white/35 text-foreground"
                    : "border-white/15 text-foreground hover:border-white/30"
              }`;

              if (selectable && onSelectSize) {
                return (
                  <button
                    key={size.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectSize(size.id)}
                    className={className}
                  >
                    {size.name}
                  </button>
                );
              }

              return (
                <span key={size.id} className={className}>
                  {size.name}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
