"use client";

import { useTranslations } from "next-intl";
import {
  type DragEvent,
  type ReactNode,
  useState,
} from "react";
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
  useReorderCategoriesMutation,
  useReorderColorsMutation,
  useReorderGendersMutation,
  useReorderSizesMutation,
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

function reorderById<T extends { id: string }>(
  items: T[],
  fromId: string,
  toId: string,
): T[] {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function moveByOffset<T extends { id: string }>(
  items: T[],
  id: string,
  offset: -1 | 1,
): T[] {
  const fromIndex = items.findIndex((item) => item.id === id);
  const toIndex = fromIndex + offset;
  if (fromIndex < 0 || toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  return reorderById(items, id, items[toIndex]!.id);
}

type SortableListProps<T extends { id: string }> = {
  items: T[];
  disabled?: boolean;
  moveUpLabel: string;
  moveDownLabel: string;
  dragHint: string;
  onReorder: (next: T[]) => void;
  renderContent: (item: T) => ReactNode;
  renderActions: (item: T) => ReactNode;
};

function SortableList<T extends { id: string }>({
  items,
  disabled = false,
  moveUpLabel,
  moveDownLabel,
  dragHint,
  onReorder,
  renderContent,
  renderActions,
}: SortableListProps<T>) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);

  const handleDragStart = (event: DragEvent<HTMLLIElement>, id: string) => {
    if (disabled) {
      return;
    }
    setDragId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (event: DragEvent<HTMLLIElement>, id: string) => {
    if (disabled) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropId(id);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, id: string) => {
    event.preventDefault();
    if (disabled) {
      return;
    }
    const fromId = dragId ?? event.dataTransfer.getData("text/plain");
    if (fromId) {
      const next = reorderById(items, fromId, id);
      if (next !== items) {
        onReorder(next);
      }
    }
    setDragId(null);
    setDropId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDropId(null);
  };

  return (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {items.map((item, index) => {
        const isDragging = dragId === item.id;
        const isDropTarget = dropId === item.id && dragId !== item.id;

        return (
          <li
            key={item.id}
            draggable={!disabled}
            onDragStart={(event) => handleDragStart(event, item.id)}
            onDragOver={(event) => handleDragOver(event, item.id)}
            onDrop={(event) => handleDrop(event, item.id)}
            onDragEnd={handleDragEnd}
            title={dragHint}
            className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${
              isDragging ? "opacity-40" : ""
            } ${isDropTarget ? "bg-white/5" : ""} ${
              disabled ? "" : "cursor-grab active:cursor-grabbing"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex shrink-0 flex-col gap-0.5 pt-0.5">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  aria-label={moveUpLabel}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    const next = moveByOffset(items, item.id, -1);
                    if (next !== items) {
                      onReorder(next);
                    }
                  }}
                  className="rounded px-1.5 py-0.5 text-xs text-muted transition hover:bg-white/10 hover:text-foreground disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={disabled || index === items.length - 1}
                  aria-label={moveDownLabel}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    const next = moveByOffset(items, item.id, 1);
                    if (next !== items) {
                      onReorder(next);
                    }
                  }}
                  className="rounded px-1.5 py-0.5 text-xs text-muted transition hover:bg-white/10 hover:text-foreground disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <div className="min-w-0 flex-1">{renderContent(item)}</div>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">{renderActions(item)}</div>
          </li>
        );
      })}
    </ul>
  );
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
  const reorderCategories = useReorderCategoriesMutation();
  const createColor = useCreateColorMutation();
  const updateColor = useUpdateColorMutation();
  const deleteColor = useDeleteColorMutation();
  const reorderColors = useReorderColorsMutation();
  const createSize = useCreateSizeMutation();
  const updateSize = useUpdateSizeMutation();
  const deleteSize = useDeleteSizeMutation();
  const reorderSizes = useReorderSizesMutation();
  const createGender = useCreateGenderMutation();
  const updateGender = useUpdateGenderMutation();
  const deleteGender = useDeleteGenderMutation();
  const reorderGenders = useReorderGendersMutation();

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

  const [localCategories, setLocalCategories] = useState<CatalogCategory[]>([]);
  const [localColors, setLocalColors] = useState<CatalogColor[]>([]);
  const [localSizes, setLocalSizes] = useState<CatalogSize[]>([]);
  const [localGenders, setLocalGenders] = useState<CatalogGender[]>([]);
  const [categoriesSyncedFrom, setCategoriesSyncedFrom] = useState<
    CatalogCategory[] | undefined
  >(undefined);
  const [colorsSyncedFrom, setColorsSyncedFrom] = useState<CatalogColor[] | undefined>(
    undefined,
  );
  const [sizesSyncedFrom, setSizesSyncedFrom] = useState<CatalogSize[] | undefined>(
    undefined,
  );
  const [gendersSyncedFrom, setGendersSyncedFrom] = useState<CatalogGender[] | undefined>(
    undefined,
  );

  const categoriesData = categoriesQuery.data?.data;
  if (categoriesData !== categoriesSyncedFrom) {
    setCategoriesSyncedFrom(categoriesData);
    if (categoriesData) {
      setLocalCategories(categoriesData);
    }
  }

  const colorsData = colorsQuery.data?.data;
  if (colorsData !== colorsSyncedFrom) {
    setColorsSyncedFrom(colorsData);
    if (colorsData) {
      setLocalColors(colorsData);
    }
  }

  const sizesData = sizesQuery.data?.data;
  if (sizesData !== sizesSyncedFrom) {
    setSizesSyncedFrom(sizesData);
    if (sizesData) {
      setLocalSizes(sizesData);
    }
  }

  const gendersData = gendersQuery.data?.data;
  if (gendersData !== gendersSyncedFrom) {
    setGendersSyncedFrom(gendersData);
    if (gendersData) {
      setLocalGenders(gendersData);
    }
  }

  const pending =
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending ||
    reorderCategories.isPending ||
    createColor.isPending ||
    updateColor.isPending ||
    deleteColor.isPending ||
    reorderColors.isPending ||
    createSize.isPending ||
    updateSize.isPending ||
    deleteSize.isPending ||
    reorderSizes.isPending ||
    createGender.isPending ||
    updateGender.isPending ||
    deleteGender.isPending ||
    reorderGenders.isPending;

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

    const payload = {
      name,
    };

    try {
      if (editingSize) {
        await updateSize.mutateAsync({
          id: editingSize.id,
          payload,
        });
        toast(t("savedToast"));
      } else {
        await createSize.mutateAsync(payload);
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

  const persistCategoryOrder = async (next: CatalogCategory[]) => {
    const previous = localCategories;
    setLocalCategories(next);
    setError(null);
    try {
      await reorderCategories.mutateAsync(next.map((item) => item.id));
    } catch (err) {
      setLocalCategories(previous);
      handleApiError(err, t("unableToReorder"));
    }
  };

  const persistColorOrder = async (next: CatalogColor[]) => {
    const previous = localColors;
    setLocalColors(next);
    setError(null);
    try {
      await reorderColors.mutateAsync(next.map((item) => item.id));
    } catch (err) {
      setLocalColors(previous);
      handleApiError(err, t("unableToReorder"));
    }
  };

  const persistSizeOrder = async (next: CatalogSize[]) => {
    const previous = localSizes;
    setLocalSizes(next);
    setError(null);
    try {
      await reorderSizes.mutateAsync(next.map((item) => item.id));
    } catch (err) {
      setLocalSizes(previous);
      handleApiError(err, t("unableToReorder"));
    }
  };

  const persistGenderOrder = async (next: CatalogGender[]) => {
    const previous = localGenders;
    setLocalGenders(next);
    setError(null);
    try {
      await reorderGenders.mutateAsync(next.map((item) => item.id));
    } catch (err) {
      setLocalGenders(previous);
      handleApiError(err, t("unableToReorder"));
    }
  };

  const toggleCategoryActive = async (category: CatalogCategory) => {
    setError(null);
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        payload: { is_active: !category.is_active },
      });
      toast(category.is_active ? t("disabledToast") : t("enabledToast"));
    } catch (err) {
      handleApiError(err, t("unableToSave"));
    }
  };

  const toggleColorActive = async (color: CatalogColor) => {
    setError(null);
    try {
      await updateColor.mutateAsync({
        id: color.id,
        payload: { is_active: !color.is_active },
      });
      toast(color.is_active ? t("disabledToast") : t("enabledToast"));
    } catch (err) {
      handleApiError(err, t("unableToSave"));
    }
  };

  const toggleSizeActive = async (size: CatalogSize) => {
    setError(null);
    try {
      await updateSize.mutateAsync({
        id: size.id,
        payload: { is_active: !size.is_active },
      });
      toast(size.is_active ? t("disabledToast") : t("enabledToast"));
    } catch (err) {
      handleApiError(err, t("unableToSave"));
    }
  };

  const toggleGenderActive = async (gender: CatalogGender) => {
    setError(null);
    try {
      await updateGender.mutateAsync({
        id: gender.id,
        payload: { is_active: !gender.is_active },
      });
      toast(gender.is_active ? t("disabledToast") : t("enabledToast"));
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

  const sortControls = {
    moveUpLabel: t("moveUp"),
    moveDownLabel: t("moveDown"),
    dragHint: t("dragHint"),
  };

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
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/3 p-5">
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
          ) : localCategories.length === 0 ? (
            <p className="text-sm text-muted">{t("emptyCategories")}</p>
          ) : (
            <>
              <p className="text-xs text-muted">{t("dragHint")}</p>
              <SortableList
                items={localCategories}
                disabled={pending}
                {...sortControls}
                onReorder={(next) => void persistCategoryOrder(next)}
                renderContent={(category) => (
                  <div>
                    <p className="font-medium text-foreground">
                      {[category.name_en, category.name_sq].filter(Boolean).join(" / ")}
                    </p>
                    <p className="mt-1 text-xs text-muted">{category.slug}</p>
                    {category.description_en || category.description_sq ? (
                      <p className="mt-1 text-sm text-muted">
                        {[category.description_en, category.description_sq]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    ) : null}
                  </div>
                )}
                renderActions={(category) => (
                  <>
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
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void toggleCategoryActive(category)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {category.is_active ? t("disable") : t("enable")}
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
                      className="rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
                    >
                      {t("delete")}
                    </button>
                  </>
                )}
              />
            </>
          )}
        </section>
      ) : null}

      {tab === "colors" ? (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/3 p-5">
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
          ) : localColors.length === 0 ? (
            <p className="text-sm text-muted">{t("emptyColors")}</p>
          ) : (
            <>
              <p className="text-xs text-muted">{t("dragHint")}</p>
              <SortableList
                items={localColors}
                disabled={pending}
                {...sortControls}
                onReorder={(next) => void persistColorOrder(next)}
                renderContent={(color) => (
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
                )}
                renderActions={(color) => (
                  <>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setEditingColor(color);
                        setColorNameEn(color.name_en ?? "");
                        setColorNameSq(color.name_sq ?? "");
                        setColorHex(color.hex);
                      }}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void toggleColorActive(color)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {color.is_active ? t("disable") : t("enable")}
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
                      className="rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
                    >
                      {t("delete")}
                    </button>
                  </>
                )}
              />
            </>
          )}
        </section>
      ) : null}

      {tab === "sizes" ? (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/3 p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {editingSize ? t("editSize") : t("addSize")}
            </h2>
            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <div>
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
          ) : localSizes.length === 0 ? (
            <p className="text-sm text-muted">{t("emptySizes")}</p>
          ) : (
            <>
              <p className="text-xs text-muted">{t("dragHint")}</p>
              <SortableList
                items={localSizes}
                disabled={pending}
                {...sortControls}
                onReorder={(next) => void persistSizeOrder(next)}
                renderContent={(size) => (
                  <div>
                    <p className="font-medium text-foreground">{size.name}</p>
                  </div>
                )}
                renderActions={(size) => (
                  <>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setEditingSize(size);
                        setSizeName(size.name);
                      }}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void toggleSizeActive(size)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {size.is_active ? t("disable") : t("enable")}
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
                      className="rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
                    >
                      {t("delete")}
                    </button>
                  </>
                )}
              />
            </>
          )}
        </section>
      ) : null}

      {tab === "genders" ? (
        <section className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/3 p-5">
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
          ) : localGenders.length === 0 ? (
            <p className="text-sm text-muted">{t("emptyGenders")}</p>
          ) : (
            <>
              <p className="text-xs text-muted">{t("dragHint")}</p>
              <SortableList
                items={localGenders}
                disabled={pending}
                {...sortControls}
                onReorder={(next) => void persistGenderOrder(next)}
                renderContent={(gender) => (
                  <div>
                    <p className="font-medium text-foreground">
                      {[gender.name_en, gender.name_sq].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                )}
                renderActions={(gender) => (
                  <>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setEditingGender(gender);
                        setGenderNameEn(gender.name_en ?? "");
                        setGenderNameSq(gender.name_sq ?? "");
                      }}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void toggleGenderActive(gender)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground disabled:opacity-60"
                    >
                      {gender.is_active ? t("disable") : t("enable")}
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
                      className="rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
                    >
                      {t("delete")}
                    </button>
                  </>
                )}
              />
            </>
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
