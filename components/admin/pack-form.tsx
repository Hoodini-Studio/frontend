"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import {
  useCreateBundleMutation,
  useUpdateBundleMutation,
} from "@/hooks/use-bundles";
import { useAdminProducts } from "@/hooks/use-products";
import { ApiError } from "@/lib/api/client";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";
import {
  appendPriceDigit,
  formatEuroFromCents,
  formatPriceEntry,
  MIN_PRODUCT_PRICE_CENTS,
  removePriceDigit,
} from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import { createProductFormSchema, type ProductFormValues } from "@/schemas/product";
import { Select } from "@/components/ui/select";
import type { Bundle, BundleInput, BundleStatus } from "@/types/bundle";
import type {
  ProductColorItem,
  ProductStatus,
  ProductTaxonomyItem,
} from "@/types/product";

const MAX_ITEM_QUANTITY = 10;

type PackFormProps = {
  pack?: Bundle;
};

type PackProductInfo = {
  id: string;
  name: string;
  price: number;
  primary_image_url: string | null;
  colors: ProductColorItem[];
  sizes: ProductTaxonomyItem[];
};

type LineState = {
  key: string;
  product_id: string;
  quantity: number;
  color_ids: string[];
  size_ids: string[];
};

function linesFromPack(pack?: Bundle): LineState[] {
  return [...(pack?.items ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      key: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      color_ids: item.color_ids ?? item.colors.map((color) => color.id),
      size_ids: item.size_ids ?? item.sizes.map((size) => size.id),
    }));
}

const chipClass = (selected: boolean) =>
  `rounded-lg border px-3 py-1.5 text-sm transition ${
    selected
      ? "border-white/40 bg-white/10 text-foreground"
      : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
  }`;

export function PackForm({ pack }: PackFormProps) {
  const t = useTranslations("adminPacks");
  const tValidation = useTranslations("validation");
  const locale = normalizeLocale(useLocale());
  const { translateMessage } = useApiMessageTranslator();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useCreateBundleMutation();
  const updateMutation = useUpdateBundleMutation(pack?.id ?? "");
  const saveLockRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [priceCents, setPriceCents] = useState(pack?.price ?? 0);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [lines, setLines] = useState<LineState[]>(() => linesFromPack(pack));
  const [isSaving, setIsSaving] = useState(false);

  const productsQuery = useAdminProducts({ status: "published", perPage: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductFormSchema(tValidation)),
    defaultValues: {
      name: pack?.name ?? "",
      description_en: pack?.description_en ?? "",
      description_sq: pack?.description_sq ?? "",
    },
  });

  const pending = isSaving || isSubmitting;

  const productsById = useMemo(() => {
    const map = new Map<string, PackProductInfo>();

    // Fallback: products already in the pack (may be unpublished now).
    for (const item of pack?.items ?? []) {
      if (!item.product) {
        continue;
      }

      map.set(item.product_id, {
        id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        primary_image_url: item.product.primary_image_url,
        colors: item.product.colors ?? item.colors,
        sizes: item.product.sizes ?? item.sizes,
      });
    }

    for (const product of productsQuery.data?.data ?? []) {
      map.set(product.id, {
        id: product.id,
        name: product.name,
        price: product.price,
        primary_image_url: product.primary_image_url,
        colors: product.colors ?? [],
        sizes: product.sizes ?? [],
      });
    }

    return map;
  }, [pack?.items, productsQuery.data?.data]);

  const suggestedCents = useMemo(() => {
    const resolved = lines.every((line) => productsById.has(line.product_id));

    if (!resolved) {
      return pack?.suggested_price_cents ?? null;
    }

    return lines.reduce(
      (sum, line) => sum + (productsById.get(line.product_id)?.price ?? 0) * line.quantity,
      0,
    );
  }, [lines, pack?.suggested_price_cents, productsById]);

  const availableProducts = useMemo(() => {
    const used = new Set(lines.map((line) => line.product_id));

    return (productsQuery.data?.data ?? []).filter((product) => !used.has(product.id));
  }, [lines, productsQuery.data?.data]);

  const updateLine = (key: string, patch: Partial<LineState>) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
    setItemsError(null);
  };

  const toggleLineId = (line: LineState, field: "color_ids" | "size_ids", id: string) => {
    const current = line[field];

    updateLine(line.key, {
      [field]: current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    });
  };

  const addProduct = (productId: string) => {
    const product = productsById.get(productId);

    if (!product) {
      return;
    }

    setLines((current) => [
      ...current,
      {
        key: crypto.randomUUID(),
        product_id: product.id,
        quantity: 1,
        color_ids: product.colors.map((color) => color.id),
        size_ids: product.sizes.map((size) => size.id),
      },
    ]);
    setItemsError(null);
  };

  const removeLine = (key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  };

  const moveLine = (index: number, direction: -1 | 1) => {
    setLines((current) => {
      const target = index + direction;

      if (target < 0 || target >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handlePriceKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      setPriceCents((current) => removePriceDigit(current));
      setPriceError(null);
    }
  };

  const handlePriceBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const inputEvent = event.nativeEvent as InputEvent;
    const data = inputEvent.data;

    if (
      inputEvent.inputType === "deleteContentBackward" ||
      inputEvent.inputType === "deleteContentForward"
    ) {
      event.preventDefault();
      setPriceCents((current) => removePriceDigit(current));
      setPriceError(null);
      return;
    }

    if (data == null) {
      return;
    }

    event.preventDefault();

    if (/^\d$/.test(data)) {
      setPriceCents((current) => appendPriceDigit(current, Number(data)));
      setPriceError(null);
    }
  };

  const submitWithStatus = (status: ProductStatus) =>
    handleSubmit(async (values) => {
      if (saveLockRef.current) {
        return;
      }

      setFormError(null);
      setItemsError(null);

      if (priceCents < MIN_PRODUCT_PRICE_CENTS) {
        setPriceError(tValidation("priceMin"));
        return;
      }

      if (lines.length < 1) {
        setItemsError(t("itemsRequired"));
        return;
      }

      for (const line of lines) {
        const product = productsById.get(line.product_id);

        if (
          (product?.colors.length ?? 0) > 0 && line.color_ids.length === 0
        ) {
          setItemsError(t("colorsRequired", { name: product?.name ?? "" }));
          return;
        }

        if (
          (product?.sizes.length ?? 0) > 0 && line.size_ids.length === 0
        ) {
          setItemsError(t("sizesRequired", { name: product?.name ?? "" }));
          return;
        }
      }

      setPriceError(null);
      saveLockRef.current = true;
      setIsSaving(true);

      try {
        const payload: BundleInput = {
          name: values.name.trim(),
          description_en: values.description_en?.trim() ? values.description_en.trim() : null,
          description_sq: values.description_sq?.trim() ? values.description_sq.trim() : null,
          price: priceCents,
          status: status as BundleStatus,
          items: lines.map((line, index) => ({
            product_id: line.product_id,
            quantity: line.quantity,
            sort_order: index,
            color_ids: line.color_ids,
            size_ids: line.size_ids,
          })),
        };

        if (pack) {
          await updateMutation.mutateAsync(payload);
        } else {
          await createMutation.mutateAsync(payload);
        }

        await queryClient.invalidateQueries({ queryKey: ["admin", "bundles"] });
        toast(t("savedToast"));
        router.push("/admin/packs");
        router.refresh();
      } catch (error) {
        if (error instanceof ApiError) {
          setFormError(translateMessage(error.message));
          return;
        }

        setFormError(t("unableToSave"));
      } finally {
        saveLockRef.current = false;
        setIsSaving(false);
      }
    });

  return (
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/3 p-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-muted">
            {t("name")}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="off"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
            {...register("name")}
          />
          {errors.name ? (
            <p className="mt-2 text-sm text-red-300">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="description_en" className="mb-2 block text-sm text-muted">
              {t("descriptionEn")}
            </label>
            <textarea
              id="description_en"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
              {...register("description_en")}
            />
          </div>
          <div>
            <label htmlFor="description_sq" className="mb-2 block text-sm text-muted">
              {t("descriptionSq")}
            </label>
            <textarea
              id="description_sq"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
              {...register("description_sq")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-2 block text-sm text-muted">
              {t("price")}
            </label>
            <div className="relative">
              <input
                id="price"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={formatPriceEntry(priceCents)}
                onKeyDown={handlePriceKeyDown}
                onBeforeInput={handlePriceBeforeInput}
                onChange={() => {}}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-14 font-mono text-lg tracking-wide text-foreground outline-none transition focus:border-white/30"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                €
              </span>
            </div>
            {priceError ? (
              <p className="mt-2 text-sm text-red-300">{priceError}</p>
            ) : (
              <p className="mt-2 text-xs text-muted">
                {t("priceHint", { amount: formatEuroFromCents(priceCents) })}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 block text-sm text-muted">{t("suggestedPrice")}</p>
            <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-lg text-foreground">
              {suggestedCents != null ? formatEuroFromCents(suggestedCents) : "—"}
            </p>
            <p className="mt-2 text-xs text-muted">{t("suggestedPriceHint")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/3 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("itemsTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("itemsHint")}</p>
        </div>

        {lines.length > 0 ? (
          <ul className="space-y-4">
            {lines.map((line, index) => {
              const product = productsById.get(line.product_id);

              return (
                <li
                  key={line.key}
                  className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-white/4">
                      {product?.primary_image_url ? (
                        <Image
                          src={product.primary_image_url}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {product?.name ?? t("unknownProduct")}
                      </p>
                      {product ? (
                        <p className="text-xs text-muted">
                          {formatEuroFromCents(product.price)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        disabled={pending || index === 0}
                        onClick={() => moveLine(index, -1)}
                        aria-label={t("moveUp")}
                        className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={pending || index === lines.length - 1}
                        onClick={() => moveLine(index, 1)}
                        aria-label={t("moveDown")}
                        className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => removeLine(line.key)}
                        className="ml-1 rounded-lg border border-red-300/40 px-3 py-1 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
                      >
                        {t("removeItem")}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">{t("quantity")}</span>
                    <button
                      type="button"
                      disabled={pending || line.quantity <= 1}
                      onClick={() => updateLine(line.key, { quantity: line.quantity - 1 })}
                      className="rounded-lg border border-white/15 px-3 py-1 text-sm text-muted transition hover:bg-white/5 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm text-foreground">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={pending || line.quantity >= MAX_ITEM_QUANTITY}
                      onClick={() => updateLine(line.key, { quantity: line.quantity + 1 })}
                      className="rounded-lg border border-white/15 px-3 py-1 text-sm text-muted transition hover:bg-white/5 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {(product?.colors.length ?? 0) > 0 ? (
                    <div>
                      <p className="mb-2 text-sm text-muted">{t("allowedColors")}</p>
                      <div className="flex flex-wrap gap-2">
                        {product!.colors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            disabled={pending}
                            aria-pressed={line.color_ids.includes(color.id)}
                            onClick={() => toggleLineId(line, "color_ids", color.id)}
                            className={`inline-flex items-center gap-2 ${chipClass(
                              line.color_ids.includes(color.id),
                            )}`}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: color.hex }}
                              aria-hidden="true"
                            />
                            {localizedName(color, locale)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {(product?.sizes.length ?? 0) > 0 ? (
                    <div>
                      <p className="mb-2 text-sm text-muted">{t("allowedSizes")}</p>
                      <div className="flex flex-wrap gap-2">
                        {product!.sizes.map((size) => (
                          <button
                            key={size.id}
                            type="button"
                            disabled={pending}
                            aria-pressed={line.size_ids.includes(size.id)}
                            onClick={() => toggleLineId(line, "size_ids", size.id)}
                            className={chipClass(line.size_ids.includes(size.id))}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        <div>
          <p className="mb-2 text-sm text-muted">{t("addProduct")}</p>
          {productsQuery.isLoading ? (
            <p className="text-sm text-muted">{t("productsLoading")}</p>
          ) : availableProducts.length === 0 ? (
            <p className="text-sm text-muted">{t("noProductsAvailable")}</p>
          ) : (
            <Select
              value=""
              onChange={(value) => {
                if (value) {
                  addProduct(value);
                }
              }}
              disabled={pending}
              placeholder={t("addProductPlaceholder")}
              options={availableProducts.map((product) => ({
                value: product.id,
                label: `${product.name} — ${formatEuroFromCents(product.price)}`,
              }))}
            />
          )}
        </div>

        {itemsError ? <p className="text-sm text-red-300">{itemsError}</p> : null}
      </div>

      {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => void submitWithStatus("draft")()}
          className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-foreground transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? t("saving") : t("saveDraft")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void submitWithStatus("published")()}
          className="rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? t("saving") : t("savePublish")}
        </button>
      </div>
    </form>
  );
}
