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
};

export function ProductCatalogOptions({
  product,
  locale,
  categoryLabel,
  genderLabel,
  colorLabel,
  sizeLabel,
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
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {colorLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color) => (
              <span
                key={color.id}
                className="inline-flex items-center gap-2 border border-white/15 px-3 py-1.5 text-sm text-foreground"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                {localizedName(color, locale)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {sizeLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span
                key={size.id}
                className="min-w-10 border border-white/15 px-3 py-1.5 text-center text-sm text-foreground"
              >
                {size.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
