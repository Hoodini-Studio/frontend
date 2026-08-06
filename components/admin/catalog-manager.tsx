"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  useAdminCategories,
  useAdminColors,
  useAdminGenders,
  useAdminSizes,
  useCreateCategoryMutation,
  useCreateColorMutation,
  useCreateGenderMutation,
  useCreateSizeMutation,
  useDeleteCategoryMutation,
  useDeleteColorMutation,
  useDeleteGenderMutation,
  useDeleteSizeMutation,
  useUpdateCategoryMutation,
  useUpdateColorMutation,
  useUpdateGenderMutation,
  useUpdateSizeMutation,
} from "@/hooks/use-catalog";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import { ApiError } from "@/lib/api/client";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/providers/toast-provider";
import type {
  CatalogCategory,
  CatalogColor,
  CatalogGender,
  CatalogSize,
} from "@/types/catalog";

type CatalogTab = "categories" | "colors" | "sizes" | "genders";

type PendingDelete = {
  id: string;
  name: string;
  kind: CatalogTab;
};

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  return trimmed;
}

export function CatalogManager() {
  const t = useTranslations("adminCatalog");
  const { translateMessage } = useApiMessageTranslator();
  const { toast } = useToast();
  const [tab, setTab] = useState<CatalogTab>("categories");
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const categoriesQuery = useAdminCategories();
  const colorsQuery = useAdminColors();
  const sizesQuery = useAdminSizes();
  const gendersQuery = useAdminGenders();

  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();
  const createColor = useCreateColorMutation();
  const updateColor = useUpdateColorMutation();
  const deleteColor = useDeleteColorMutation();
  const createSize = useCreateSizeMutation();
  const updateSize = useUpdateSizeMutation();
  const deleteSize = useDeleteSizeMutation();
  const createGender = useCreateGenderMutation();
  const updateGender = useUpdateGenderMutation();
  const deleteGender = useDeleteGenderMutation();

  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categoryNameSq, setCategoryNameSq] = useState("");
  const [categoryDescriptionEn, setCategoryDescriptionEn] = useState("");
  const [categoryDescriptionSq, setCategoryDescriptionSq] = useState("");
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null);

  const [colorNameEn, setColorNameEn] = useState("");
  const [colorNameSq, setColorNameSq] = useState("");
  const [colorHex, setColorHex] = useState("#111111");
  const [editingColor, setEditingColor] = useState<CatalogColor | null>(null);

  const [sizeName, setSizeName] = useState("");
  const [editingSize, setEditingSize] = useState<CatalogSize | null>(null);

  const [genderNameEn, setGenderNameEn] = useState("");
  const [genderNameSq, setGenderNameSq] = useState("");
  const [editingGender, setEditingGender] = useState<CatalogGender | null>(null);

  const pending =
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending ||
    createColor.isPending ||
    updateColor.isPending ||
    deleteColor.isPending ||
    createSize.isPending ||
    updateSize.isPending ||
    deleteSize.isPending ||
    createGender.isPending ||
    updateGender.isPending ||
    deleteGender.isPending;

  const handleApiError = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) {
      setError(translateMessage(err.message));
      return;
    }
    setError(fallback);
  };

  const isDeleting =
    deleteCategory.isPending ||
    deleteColor.isPending ||
    deleteSize.isPending ||
    deleteGender.isPending;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setError(null);

    try {
      if (pendingDelete.kind === "categories") {
        await deleteCategory.mutateAsync(pendingDelete.id);
        if (editingCategory?.id === pendingDelete.id) {
          resetCategoryForm();
        }
      } else if (pendingDelete.kind === "colors") {
        await deleteColor.mutateAsync(pendingDelete.id);
        if (editingColor?.id === pendingDelete.id) {
          resetColorForm();
        }
      } else if (pendingDelete.kind === "sizes") {
        await deleteSize.mutateAsync(pendingDelete.id);
        if (editingSize?.id === pendingDelete.id) {
          resetSizeForm();
        }
      } else {
        await deleteGender.mutateAsync(pendingDelete.id);
        if (editingGender?.id === pendingDelete.id) {
          resetGenderForm();
        }
      }

      setPendingDelete(null);
      toast(t("deletedToast"));
    } catch (err) {
      handleApiError(err, t("unableToDelete"));
    }
  };

  const resetCategoryForm = () => {
    setCategoryNameEn("");
    setCategoryNameSq("");
    setCategoryDescriptionEn("");
    setCategoryDescriptionSq("");
    setEditingCategory(null);
  };

  const resetColorForm = () => {
    setColorNameEn("");
    setColorNameSq("");
    setColorHex("#111111");
    setEditingColor(null);
  };

  const resetSizeForm = () => {
    setSizeName("");
    setEditingSize(null);
  };

  const resetGenderForm = () => {
    setGenderNameEn("");
    setGenderNameSq("");
    setEditingGender(null);
  };

  const submitCategory = async () => {
    setError(null);
    const nameEn = categoryNameEn.trim();
    const nameSq = categoryNameSq.trim();
    if (!nameEn && !nameSq) {
      setError(t("nameRequired"));
      return;
    }

    const payload = {
      name_en: nameEn || null,
      name_sq: nameSq || null,
      description_en: categoryDescriptionEn.trim() || null,
      description_sq: categoryDescriptionSq.trim() || null,
    };

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          payload,
        });
        toast(t("savedToast"));
      } else {
        await createCategory.mutateAsync(payload);
        toast(t("createdToast"));
      }
      resetCategoryForm();
    } catch (err) {
      handleApiError(err, t("unableToSave"));
    }
  };

  const submitColor = async () => {
    setError(null);
    const nameEn = colorNameEn.trim();
    const nameSq = colorNameSq.trim();
    const hex = normalizeHex(colorHex);
    if (!nameEn && !nameSq) {
      setError(t("nameRequired"));
      return;
    }
    if (!/^#[0-9A-F]{6}$/.test(hex)) {
      setError(t("hexInvalid"));
      return;
    }

    const payload = {
      name_en: nameEn || null,
      name_sq: nameSq || null,
      hex,
    };

    try {
      if (editingColor) {
        await updateColor.mutateAsync({
          id: editingColor.id,
          payload,
        });
        toast(t("savedToast"));
      } else {
        await createColor.mutateAsync(payload);
        toast(t("createdToast"));
      }
      resetColorForm();
    } catch (err) {
      handleApiError(err, t("unableToSave"));
    }
  };

  const submitSize = async () => {
    setError(null);
    const name = sizeName.trim();
    if (!name) {
      setError(t("nameRequired"));
      return;
    }

    try {
      if (editingSize) {
        await updateSize.mutateAsync({
          id: editingSize.id,
          payload: { name },
        });
        toast(t("savedToast"));
      } else {
        await createSize.mutateAsync({ name });
        toast(t("createdToast"));
      }
      resetSizeForm();
    } catch (err) {
      handleApiError(err, t("unableToSave"));
    }
  };

  const submitGender = async () => {
    setError(null);
    const nameEn = genderNameEn.trim();
    const nameSq = genderNameSq.trim();
    if (!nameEn && !nameSq) {
      setError(t("nameRequired"));
      return;
    }

    const payload = {
      name_en: nameEn || null,
      name_sq: nameSq || null,
    };

    try {
      if (editingGender) {
        await updateGender.mutateAsync({
          id: editingGender.id,
          payload,
        });
        toast(t("savedToast"));
      } else {
        await createGender.mutateAsync(payload);
        toast(t("createdToast"));
      }
      resetGenderForm();
    } catch (err) {
      handleApiError(err, t("unableToSave"));
    }
  };

  const tabs: { id: CatalogTab; label: string }[] = [
    { id: "categories", label: t("tabCategories") },
    { id: "colors", label: t("tabColors") },
    { id: "sizes", label: t("tabSizes") },
    { id: "genders", label: t("tabGenders") },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setError(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              tab === item.id
                ? "bg-white/10 text-foreground"
                : "text-muted hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {tab === "categories" ? (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {editingCategory ? t("editCategory") : t("addCategory")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category-name-en" className="mb-2 block text-sm text-muted">
                  {t("nameEn")}
                </label>
                <input
                  id="category-name-en"
                  value={categoryNameEn}
                  onChange={(event) => setCategoryNameEn(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
              <div>
                <label htmlFor="category-name-sq" className="mb-2 block text-sm text-muted">
                  {t("nameSq")}
                </label>
                <input
                  id="category-name-sq"
                  value={categoryNameSq}
                  onChange={(event) => setCategoryNameSq(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
              <div>
                <label htmlFor="category-description-en" className="mb-2 block text-sm text-muted">
                  {t("descriptionEn")}
                </label>
                <input
                  id="category-description-en"
                  value={categoryDescriptionEn}
                  onChange={(event) => setCategoryDescriptionEn(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
              <div>
                <label htmlFor="category-description-sq" className="mb-2 block text-sm text-muted">
                  {t("descriptionSq")}
                </label>
                <input
                  id="category-description-sq"
                  value={categoryDescriptionSq}
                  onChange={(event) => setCategoryDescriptionSq(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => void submitCategory()}
                className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
              >
                {editingCategory ? t("save") : t("add")}
              </button>
              {editingCategory ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={resetCategoryForm}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5"
                >
                  {t("cancel")}
                </button>
              ) : null}
            </div>
          </div>

          {categoriesQuery.isLoading ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : categoriesQuery.isError ? (
            <p className="text-sm text-red-300">{t("unableToLoad")}</p>
          ) : (categoriesQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("emptyCategories")}</p>
          ) : (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {categoriesQuery.data?.data.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {[category.name_en, category.name_sq].filter(Boolean).join(" / ")}
                    </p>
                    <p className="mt-1 text-xs text-muted">{category.slug}</p>
                    {(category.description_en || category.description_sq) ? (
                      <p className="mt-1 text-sm text-muted">
                        {[category.description_en, category.description_sq]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryNameEn(category.name_en ?? "");
                        setCategoryNameSq(category.name_sq ?? "");
                        setCategoryDescriptionEn(category.description_en ?? "");
                        setCategoryDescriptionSq(category.description_sq ?? "");
                      }}
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setPendingDelete({
                          id: category.id,
                          name: [category.name_en, category.name_sq].filter(Boolean).join(" / "),
                          kind: "categories",
                        });
                      }}
                      className="text-sm text-red-300 transition hover:opacity-80"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "colors" ? (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {editingColor ? t("editColor") : t("addColor")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="color-name-en" className="mb-2 block text-sm text-muted">
                  {t("nameEn")}
                </label>
                <input
                  id="color-name-en"
                  value={colorNameEn}
                  onChange={(event) => setColorNameEn(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
              <div>
                <label htmlFor="color-name-sq" className="mb-2 block text-sm text-muted">
                  {t("nameSq")}
                </label>
                <input
                  id="color-name-sq"
                  value={colorNameSq}
                  onChange={(event) => setColorNameSq(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="color-hex" className="mb-2 block text-sm text-muted">
                  {t("hex")}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="color-hex-picker"
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(colorHex) ? colorHex : "#111111"}
                    onChange={(event) => setColorHex(event.target.value.toUpperCase())}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    aria-label={t("hex")}
                  />
                  <input
                    id="color-hex"
                    value={colorHex}
                    onChange={(event) => setColorHex(event.target.value)}
                    className="w-28 rounded-xl border border-white/10 bg-black/40 px-3 py-3 font-mono text-sm text-foreground outline-none transition focus:border-white/30"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => void submitColor()}
                className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
              >
                {editingColor ? t("save") : t("add")}
              </button>
              {editingColor ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={resetColorForm}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5"
                >
                  {t("cancel")}
                </button>
              ) : null}
            </div>
          </div>

          {colorsQuery.isLoading ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : colorsQuery.isError ? (
            <p className="text-sm text-red-300">{t("unableToLoad")}</p>
          ) : (colorsQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("emptyColors")}</p>
          ) : (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {colorsQuery.data?.data.map((color) => (
                <li
                  key={color.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 shrink-0 rounded-full border border-white/20"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {[color.name_en, color.name_sq].filter(Boolean).join(" / ")}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted">{color.hex}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setEditingColor(color);
                        setColorNameEn(color.name_en ?? "");
                        setColorNameSq(color.name_sq ?? "");
                        setColorHex(color.hex);
                      }}
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setPendingDelete({
                          id: color.id,
                          name: [color.name_en, color.name_sq].filter(Boolean).join(" / "),
                          kind: "colors",
                        });
                      }}
                      className="text-sm text-red-300 transition hover:opacity-80"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "sizes" ? (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {editingSize ? t("editSize") : t("addSize")}
            </h2>
            <div className="max-w-xs">
              <label htmlFor="size-name" className="mb-2 block text-sm text-muted">
                {t("name")}
              </label>
              <input
                id="size-name"
                value={sizeName}
                onChange={(event) => setSizeName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => void submitSize()}
                className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
              >
                {editingSize ? t("save") : t("add")}
              </button>
              {editingSize ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={resetSizeForm}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5"
                >
                  {t("cancel")}
                </button>
              ) : null}
            </div>
          </div>

          {sizesQuery.isLoading ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : sizesQuery.isError ? (
            <p className="text-sm text-red-300">{t("unableToLoad")}</p>
          ) : (sizesQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("emptySizes")}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {sizesQuery.data?.data.map((size) => (
                <li
                  key={size.id}
                  className="inline-flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-2"
                >
                  <span className="font-medium text-foreground">{size.name}</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setEditingSize(size);
                      setSizeName(size.name);
                    }}
                    className="text-xs text-muted transition hover:text-foreground"
                  >
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setPendingDelete({
                        id: size.id,
                        name: size.name,
                        kind: "sizes",
                      });
                    }}
                    className="text-xs text-red-300 transition hover:opacity-80"
                  >
                    {t("delete")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "genders" ? (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {editingGender ? t("editGender") : t("addGender")}
            </h2>
            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gender-name-en" className="mb-2 block text-sm text-muted">
                  {t("nameEn")}
                </label>
                <input
                  id="gender-name-en"
                  value={genderNameEn}
                  onChange={(event) => setGenderNameEn(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
              <div>
                <label htmlFor="gender-name-sq" className="mb-2 block text-sm text-muted">
                  {t("nameSq")}
                </label>
                <input
                  id="gender-name-sq"
                  value={genderNameSq}
                  onChange={(event) => setGenderNameSq(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => void submitGender()}
                className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
              >
                {editingGender ? t("save") : t("add")}
              </button>
              {editingGender ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={resetGenderForm}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5"
                >
                  {t("cancel")}
                </button>
              ) : null}
            </div>
          </div>

          {gendersQuery.isLoading ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : gendersQuery.isError ? (
            <p className="text-sm text-red-300">{t("unableToLoad")}</p>
          ) : (gendersQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">{t("emptyGenders")}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {gendersQuery.data?.data.map((gender) => (
                <li
                  key={gender.id}
                  className="inline-flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-2"
                >
                  <span className="font-medium text-foreground">
                    {[gender.name_en, gender.name_sq].filter(Boolean).join(" / ")}
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setEditingGender(gender);
                      setGenderNameEn(gender.name_en ?? "");
                      setGenderNameSq(gender.name_sq ?? "");
                    }}
                    className="text-xs text-muted transition hover:text-foreground"
                  >
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setPendingDelete({
                        id: gender.id,
                        name: [gender.name_en, gender.name_sq].filter(Boolean).join(" / "),
                        kind: "genders",
                      });
                    }}
                    className="text-xs text-red-300 transition hover:opacity-80"
                  >
                    {t("delete")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <ConfirmModal
        open={pendingDelete !== null}
        title={t("deleteTitle")}
        description={t("confirmDelete", { name: pendingDelete?.name ?? "" })}
        confirmLabel={isDeleting ? t("deleting") : t("deleteConfirm")}
        cancelLabel={t("cancel")}
        confirming={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!isDeleting) {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
