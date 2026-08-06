"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useForm } from "react-hook-form";
import { useDeleteProductImageMutation } from "@/hooks/use-products";
import {
  useAdminCategories,
  useAdminColors,
  useAdminGenders,
  useAdminSizes,
} from "@/hooks/use-catalog";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";
import {
  createAdminProduct,
  reorderAdminProductImages,
  updateAdminProduct,
  uploadAdminProductImages,
} from "@/lib/api/products";
import {
  appendPriceDigit,
  formatEuroFromCents,
  formatPriceEntry,
  MIN_PRODUCT_PRICE_CENTS,
  removePriceDigit,
} from "@/lib/money";
import {
  createProductFormSchema,
  type ProductFormValues,
} from "@/schemas/product";
import type { Product, ProductStatus } from "@/types/product";

type ProductFormProps = {
  product?: Product;
};

type GalleryItem =
  | { key: string; kind: "saved"; id: string; url: string }
  | { key: string; kind: "pending"; file: File; previewUrl: string };

function savedItemsFromProduct(product?: Product): GalleryItem[] {
  return (product?.images ?? []).map((image) => ({
    key: image.id,
    kind: "saved" as const,
    id: image.id,
    url: image.url,
  }));
}

export function ProductForm({ product }: ProductFormProps) {
  const t = useTranslations("adminProducts");
  const tValidation = useTranslations("validation");
  const { translateMessage } = useApiMessageTranslator();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [priceCents, setPriceCents] = useState(product?.price ?? 0);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(() => savedItemsFromProduct(product));
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    () => product?.categories?.map((item) => item.id) ?? [],
  );
  const [colorIds, setColorIds] = useState<string[]>(
    () => product?.colors?.map((item) => item.id) ?? [],
  );
  const [sizeIds, setSizeIds] = useState<string[]>(
    () => product?.sizes?.map((item) => item.id) ?? [],
  );
  const [genderIds, setGenderIds] = useState<string[]>(
    () => product?.genders?.map((item) => item.id) ?? [],
  );
  const saveLockRef = useRef(false);
  const deleteImageMutation = useDeleteProductImageMutation(product?.id ?? "");
  const categoriesQuery = useAdminCategories();
  const colorsQuery = useAdminColors();
  const sizesQuery = useAdminSizes();
  const gendersQuery = useAdminGenders();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductFormSchema(tValidation)),
    defaultValues: {
      name: product?.name ?? "",
      description_en: product?.description_en ?? "",
      description_sq: product?.description_sq ?? "",
    },
  });

  const pending =
    isSaving || isSubmitting || deleteImageMutation.isPending;

  const invalidateProductQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
      queryClient.invalidateQueries({ queryKey: ["products", "published"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "colors"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "sizes"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "genders"] }),
    ]);
  };

  const toggleId = (
    current: string[],
    id: string,
    setter: (value: string[]) => void,
  ) => {
    setter(current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
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

  const addPendingFiles = (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    const next: GalleryItem[] = Array.from(fileList).map((file) => ({
      key: crypto.randomUUID(),
      kind: "pending",
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setItems((current) => [...current, ...next]);
    setImagesError(null);
  };

  const removeItem = async (item: GalleryItem) => {
    if (items.length <= 1) {
      setImagesError(tValidation("imagesRequired"));
      return;
    }

    if (item.kind === "pending") {
      URL.revokeObjectURL(item.previewUrl);
      setItems((current) => current.filter((entry) => entry.key !== item.key));
      return;
    }

    if (!product) {
      return;
    }

    try {
      await deleteImageMutation.mutateAsync(item.id);
      setItems((current) => current.filter((entry) => entry.key !== item.key));
    } catch {
      toast(tValidation("imagesRequired"), { variant: "error" });
    }
  };

  const moveItem = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) {
      return;
    }

    setItems((current) => {
      const fromIndex = current.findIndex((item) => item.key === fromKey);
      const toIndex = current.findIndex((item) => item.key === toKey);

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, key: string) => {
    setDragKey(key);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", key);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, key: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropKey(key);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, key: string) => {
    event.preventDefault();
    const fromKey = dragKey ?? event.dataTransfer.getData("text/plain");
    if (fromKey) {
      moveItem(fromKey, key);
    }
    setDragKey(null);
    setDropKey(null);
  };

  const handleDragEnd = () => {
    setDragKey(null);
    setDropKey(null);
  };

  const syncImageOrder = async (productId: string, gallery: GalleryItem[]) => {
    const pendingFiles = gallery
      .filter((item): item is Extract<GalleryItem, { kind: "pending" }> => item.kind === "pending")
      .map((item) => item.file);

    const originalIds = new Set(
      gallery
        .filter((item): item is Extract<GalleryItem, { kind: "saved" }> => item.kind === "saved")
        .map((item) => item.id),
    );

    let uploaded = null as Awaited<ReturnType<typeof uploadAdminProductImages>> | null;

    if (pendingFiles.length > 0) {
      uploaded = await uploadAdminProductImages(productId, pendingFiles);
    }

    const newIds =
      uploaded?.data.images
        .filter((image) => !originalIds.has(image.id))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => image.id) ?? [];

    let newIndex = 0;
    const orderedIds = gallery.map((item) => {
      if (item.kind === "saved") {
        return item.id;
      }

      const id = newIds[newIndex];
      newIndex += 1;
      return id;
    });

    if (orderedIds.some((id) => !id) || orderedIds.length === 0) {
      throw new Error("Failed to resolve image order.");
    }

    await reorderAdminProductImages(productId, orderedIds as string[]);
  };

  const submitWithStatus = (status: ProductStatus) =>
    handleSubmit(async (values) => {
      if (saveLockRef.current) {
        return;
      }

      setFormError(null);
      setImagesError(null);

      if (priceCents < MIN_PRODUCT_PRICE_CENTS) {
        setPriceError(tValidation("priceMin"));
        return;
      }

      if (items.length < 1) {
        setImagesError(tValidation("imagesRequired"));
        return;
      }

      setPriceError(null);
      saveLockRef.current = true;
      setIsSaving(true);

      let createdProductId: string | null = null;

      try {
        const payload = {
          name: values.name.trim(),
          description_en: values.description_en?.trim()
            ? values.description_en.trim()
            : null,
          description_sq: values.description_sq?.trim()
            ? values.description_sq.trim()
            : null,
          price: priceCents,
          status,
          category_ids: categoryIds,
          color_ids: colorIds,
          size_ids: sizeIds,
          gender_ids: genderIds,
        };

        if (product) {
          await syncImageOrder(product.id, items);
          await updateAdminProduct(product.id, payload);
          await invalidateProductQueries();
          toast(t("savedToast"));
          router.push("/admin/products");
          router.refresh();
          return;
        }

        const created = await createAdminProduct({ ...payload, status: "draft" });
        createdProductId = created.data.id;

        try {
          await syncImageOrder(created.data.id, items);
        } catch {
          await invalidateProductQueries();
          router.push(`/admin/products/${created.data.id}/edit?imagesFailed=1`);
          router.refresh();
          return;
        }

        if (status === "published") {
          await updateAdminProduct(created.data.id, { status: "published" });
        }

        await invalidateProductQueries();
        toast(t("savedToast"));
        router.push("/admin/products");
        router.refresh();
      } catch (error) {
        if (createdProductId) {
          await invalidateProductQueries();
          router.push(`/admin/products/${createdProductId}/edit?imagesFailed=1`);
          router.refresh();
          return;
        }

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
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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
      </div>

      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("taxonomyTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("taxonomyHint")}</p>
        </div>

        <div>
          <p className="mb-3 text-sm text-muted">{t("categories")}</p>
          {categoriesQuery.isLoading ? (
            <p className="text-sm text-muted">{t("taxonomyLoading")}</p>
          ) : (categoriesQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("taxonomyEmpty")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categoriesQuery.data?.data.map((category) => {
                const selected = categoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    disabled={pending}
                    onClick={() => toggleId(categoryIds, category.id, setCategoryIds)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-white/40 bg-white/10 text-foreground"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {[category.name_en, category.name_sq].filter(Boolean).join(" / ") || category.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm text-muted">{t("colors")}</p>
          {colorsQuery.isLoading ? (
            <p className="text-sm text-muted">{t("taxonomyLoading")}</p>
          ) : (colorsQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("taxonomyEmpty")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {colorsQuery.data?.data.map((color) => {
                const selected = colorIds.includes(color.id);
                return (
                  <button
                    key={color.id}
                    type="button"
                    disabled={pending}
                    onClick={() => toggleId(colorIds, color.id, setColorIds)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-white/40 bg-white/10 text-foreground"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    {[color.name_en, color.name_sq].filter(Boolean).join(" / ") || color.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm text-muted">{t("sizes")}</p>
          {sizesQuery.isLoading ? (
            <p className="text-sm text-muted">{t("taxonomyLoading")}</p>
          ) : (sizesQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("taxonomyEmpty")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sizesQuery.data?.data.map((size) => {
                const selected = sizeIds.includes(size.id);
                return (
                  <button
                    key={size.id}
                    type="button"
                    disabled={pending}
                    onClick={() => toggleId(sizeIds, size.id, setSizeIds)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-white/40 bg-white/10 text-foreground"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm text-muted">{t("genders")}</p>
          {gendersQuery.isLoading ? (
            <p className="text-sm text-muted">{t("taxonomyLoading")}</p>
          ) : (gendersQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("taxonomyEmpty")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {gendersQuery.data?.data.map((gender) => {
                const selected = genderIds.includes(gender.id);
                return (
                  <button
                    key={gender.id}
                    type="button"
                    disabled={pending}
                    onClick={() => toggleId(genderIds, gender.id, setGenderIds)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-white/40 bg-white/10 text-foreground"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {[gender.name_en, gender.name_sq].filter(Boolean).join(" / ") || gender.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{t("images")}</h2>
          <p className="mt-1 text-sm text-muted">{t("imagesHint")}</p>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const previewUrl = item.kind === "saved" ? item.url : item.previewUrl;
              const isDragging = dragKey === item.key;
              const isDropTarget = dropKey === item.key && dragKey !== item.key;

              return (
                <div
                  key={item.key}
                  draggable={!pending}
                  onDragStart={(event) => handleDragStart(event, item.key)}
                  onDragOver={(event) => handleDragOver(event, item.key)}
                  onDrop={(event) => handleDrop(event, item.key)}
                  onDragEnd={handleDragEnd}
                  className={`space-y-3 ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "ring-1 ring-white/30" : ""}`}
                >
                  <div className="relative aspect-[4/5] cursor-grab overflow-hidden bg-white/[0.04] active:cursor-grabbing">
                    {item.kind === "saved" ? (
                      <Image
                        src={previewUrl}
                        alt=""
                        fill
                        unoptimized
                        className="pointer-events-none object-cover"
                        sizes="240px"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt=""
                        className="pointer-events-none h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute left-2 top-2 bg-black/65 px-2 py-1 text-[10px] font-medium tabular-nums text-foreground">
                      {index + 1}
                    </span>
                  </div>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void removeItem(item)}
                      className="text-sm text-red-300 transition hover:opacity-80 disabled:opacity-50"
                    >
                      {t("removeImage")}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="images"
            className="inline-flex cursor-pointer rounded-xl border border-white/15 px-4 py-3 text-sm text-foreground transition hover:border-white/30 hover:bg-white/5"
          >
            {t("addImages")}
          </label>
          <input
            id="images"
            type="file"
            accept="image/*,.avif,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => {
              addPendingFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {imagesError ? <p className="text-sm text-red-300">{imagesError}</p> : null}
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
