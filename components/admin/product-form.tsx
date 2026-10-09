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
  useAdminCollections,
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
import type { Product, ProductImage, ProductStatus } from "@/types/product";
import { ChipGroupSkeleton } from "@/components/ui/chip-group-skeleton";

type ProductFormProps = {
  product?: Product;
};

type GalleryItem =
  | { key: string; kind: "saved"; id: string; url: string }
  | { key: string; kind: "pending"; file: File; previewUrl: string };

type PendingGalleryItem = Extract<GalleryItem, { kind: "pending" }>;

type SavePhase = "idle" | "saving" | "uploading";

function savedItemsFromProduct(product?: Product): GalleryItem[] {
  return (product?.images ?? []).map((image) => ({
    key: image.id,
    kind: "saved" as const,
    id: image.id,
    url: image.url,
  }));
}

function newImageIds(uploaded: ProductImage[], knownIds: Set<string>): string[] {
  return uploaded
    .filter((image) => !knownIds.has(image.id))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => image.id);
}

function mergeUploadedIntoGallery(
  gallery: GalleryItem[],
  uploadedImages: ProductImage[],
  pendingKeys: Set<string>,
): GalleryItem[] {
  const knownIds = new Set(
    gallery
      .filter((item): item is Extract<GalleryItem, { kind: "saved" }> => item.kind === "saved")
      .map((item) => item.id),
  );
  const freshIds = newImageIds(uploadedImages, knownIds);
  const byId = new Map(uploadedImages.map((image) => [image.id, image]));
  let nextIndex = 0;

  return gallery.map((item) => {
    if (item.kind !== "pending" || !pendingKeys.has(item.key)) {
      return item;
    }

    const id = freshIds[nextIndex];
    nextIndex += 1;
    const image = id ? byId.get(id) : undefined;
    if (!image) {
      return item;
    }

    URL.revokeObjectURL(item.previewUrl);
    return { key: image.id, kind: "saved" as const, id: image.id, url: image.url };
  });
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
  const [savePhase, setSavePhase] = useState<SavePhase>("idle");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    () => product?.categories?.map((item) => item.id) ?? [],
  );
  const [collectionIds, setCollectionIds] = useState<string[]>(
    () => product?.collections?.map((item) => item.id) ?? [],
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
  const collectionsQuery = useAdminCollections();
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

  const busy =
    savePhase !== "idle" ||
    isSubmitting ||
    isUploadingImages ||
    deleteImageMutation.isPending;

  const saveButtonLabel =
    savePhase === "uploading" || isUploadingImages
      ? t("uploadingImages")
      : savePhase === "saving" || isSubmitting
        ? t("saving")
        : null;

  const invalidateProductQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
      queryClient.invalidateQueries({ queryKey: ["products", "published"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] }),
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
    if (!fileList?.length || busy) {
      return;
    }

    const next: PendingGalleryItem[] = Array.from(fileList).map((file) => ({
      key: crypto.randomUUID(),
      kind: "pending" as const,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setItems((current) => [...current, ...next]);
    setImagesError(null);

    // Edit: upload immediately. Create: keep local until first save (needs product id).
    if (!product) {
      return;
    }

    void (async () => {
      setIsUploadingImages(true);
      try {
        const uploaded = await uploadAdminProductImages(
          product.id,
          next.map((item) => item.file),
        );
        const pendingKeys = new Set(next.map((item) => item.key));

        let mergedGallery: GalleryItem[] = [];
        setItems((current) => {
          mergedGallery = mergeUploadedIntoGallery(
            current,
            uploaded.data.images,
            pendingKeys,
          );
          return mergedGallery;
        });

        const stillPending = mergedGallery.some((item) => pendingKeys.has(item.key));
        if (!stillPending) {
          const orderedIds = mergedGallery
            .filter(
              (item): item is Extract<GalleryItem, { kind: "saved" }> =>
                item.kind === "saved",
            )
            .map((item) => item.id);

          if (orderedIds.length > 0) {
            await reorderAdminProductImages(product.id, orderedIds);
          }
        }

        await invalidateProductQueries();
      } catch {
        setItems((current) => {
          for (const item of next) {
            if (current.some((entry) => entry.key === item.key && entry.kind === "pending")) {
              URL.revokeObjectURL(item.previewUrl);
            }
          }
          return current.filter((entry) => !next.some((item) => item.key === entry.key));
        });
        toast(t("imagesUploadFailed"), { variant: "error" });
      } finally {
        setIsUploadingImages(false);
      }
    })();
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

      // Edit + all saved: persist order right away so cover updates without waiting for Save.
      if (
        product &&
        next.every((item): item is Extract<GalleryItem, { kind: "saved" }> => item.kind === "saved")
      ) {
        const orderedIds = next.map((item) => item.id);
        queueMicrotask(() => {
          void reorderAdminProductImages(product.id, orderedIds).catch(() => {
            toast(t("imagesUploadFailed"), { variant: "error" });
          });
        });
      }

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
    const pendingItems = gallery.filter(
      (item): item is Extract<GalleryItem, { kind: "pending" }> => item.kind === "pending",
    );
    const originalIds = new Set(
      gallery
        .filter((item): item is Extract<GalleryItem, { kind: "saved" }> => item.kind === "saved")
        .map((item) => item.id),
    );

    let uploadedImages: ProductImage[] = [];

    if (pendingItems.length > 0) {
      const uploaded = await uploadAdminProductImages(
        productId,
        pendingItems.map((item) => item.file),
      );
      uploadedImages = uploaded.data.images;
    }

    const freshIds = newImageIds(uploadedImages, originalIds);
    let newIndex = 0;
    const orderedIds = gallery.map((item) => {
      if (item.kind === "saved") {
        return item.id;
      }
      const id = freshIds[newIndex];
      newIndex += 1;
      return id;
    });

    if (orderedIds.some((id) => !id) || orderedIds.length === 0) {
      throw new Error("Failed to resolve image order.");
    }

    await reorderAdminProductImages(productId, orderedIds as string[]);

    if (pendingItems.length > 0) {
      const pendingKeys = new Set(pendingItems.map((item) => item.key));
      setItems((current) =>
        mergeUploadedIntoGallery(current, uploadedImages, pendingKeys),
      );
    }
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
      setSavePhase("saving");

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
          collection_ids: collectionIds,
          color_ids: colorIds,
          size_ids: sizeIds,
          gender_ids: genderIds,
        };

        if (product) {
          const hasPending = items.some((item) => item.kind === "pending");
          if (hasPending) {
            setSavePhase("uploading");
            await syncImageOrder(product.id, items);
          } else if (
            items.every(
              (item): item is Extract<GalleryItem, { kind: "saved" }> =>
                item.kind === "saved",
            )
          ) {
            await reorderAdminProductImages(
              product.id,
              items.map((item) => item.id),
            );
          }

          setSavePhase("saving");
          await updateAdminProduct(product.id, payload);
          await invalidateProductQueries();
          toast(t("savedToast"));
          router.refresh();
          return;
        }

        const created = await createAdminProduct({ ...payload, status: "draft" });
        createdProductId = created.data.id;

        try {
          setSavePhase("uploading");
          await syncImageOrder(created.data.id, items);
        } catch {
          toast(t("imagesUploadFailed"), { variant: "error" });
          await invalidateProductQueries();
          router.push(`/admin/products/${created.data.id}/edit?imagesFailed=1`);
          router.refresh();
          return;
        }

        if (status === "published") {
          setSavePhase("saving");
          await updateAdminProduct(created.data.id, { status: "published" });
        }

        await invalidateProductQueries();
        toast(t("savedToast"));
        // Land on edit so further images upload progressively.
        router.push(`/admin/products/${created.data.id}/edit`);
        router.refresh();
      } catch (error) {
        if (createdProductId) {
          toast(t("imagesUploadFailed"), { variant: "error" });
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
        setSavePhase("idle");
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

      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/3 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("taxonomyTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("taxonomyHint")}</p>
        </div>

        <div>
          <p className="mb-3 text-sm text-muted">{t("categories")}</p>
          {categoriesQuery.isLoading ? (
            <ChipGroupSkeleton count={5} />
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
                    disabled={busy}
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
          <p className="mb-3 text-sm text-muted">{t("collections")}</p>
          {collectionsQuery.isLoading ? (
            <ChipGroupSkeleton count={5} />
          ) : (collectionsQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("taxonomyEmpty")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {collectionsQuery.data?.data.map((collection) => {
                const selected = collectionIds.includes(collection.id);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      toggleId(collectionIds, collection.id, setCollectionIds)
                    }
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-white/40 bg-white/10 text-foreground"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {[collection.name_en, collection.name_sq]
                      .filter(Boolean)
                      .join(" / ") || collection.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm text-muted">{t("colors")}</p>
          {colorsQuery.isLoading ? (
            <ChipGroupSkeleton count={5} />
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
                    disabled={busy}
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
            <ChipGroupSkeleton count={6} />
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
                    disabled={busy}
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
            <ChipGroupSkeleton count={3} />
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
                    disabled={busy}
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

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/3 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{t("images")}</h2>
          <p className="mt-1 text-sm text-muted">
            {product ? t("imagesHintEdit") : t("imagesHintCreate")}
          </p>
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
                  draggable={!busy}
                  onDragStart={(event) => handleDragStart(event, item.key)}
                  onDragOver={(event) => handleDragOver(event, item.key)}
                  onDrop={(event) => handleDrop(event, item.key)}
                  onDragEnd={handleDragEnd}
                  className={`space-y-3 ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "ring-1 ring-white/30" : ""}`}
                >
                  <div className="relative aspect-4/5 cursor-grab overflow-hidden bg-white/4 active:cursor-grabbing">
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
                    {item.kind === "pending" && (isUploadingImages || savePhase === "uploading") ? (
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-foreground">
                        {t("uploadingImages")}
                      </span>
                    ) : null}
                    {item.kind === "pending" && !product && savePhase === "idle" ? (
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-foreground">
                        {t("imagesPendingSave")}
                      </span>
                    ) : null}
                  </div>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      disabled={busy}
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
            className={`inline-flex rounded-xl border border-white/15 px-4 py-3 text-sm text-foreground transition hover:border-white/30 hover:bg-white/5 ${busy ? "pointer-events-none cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            {isUploadingImages ? t("uploadingImages") : t("addImages")}
          </label>
          <input
            id="images"
            type="file"
            accept="image/*,.avif,image/avif"
            multiple
            disabled={busy}
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
          disabled={busy}
          onClick={() => void submitWithStatus("draft")()}
          className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-foreground transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveButtonLabel ?? t("saveDraft")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void submitWithStatus("published")()}
          className="rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveButtonLabel ?? t("savePublish")}
        </button>
      </div>
    </form>
  );
}
