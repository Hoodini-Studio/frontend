"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ProductPreviewModal } from "@/components/admin/product-preview-modal";
import {
  useAdminProducts,
  useDeleteProductMutation,
} from "@/hooks/use-products";
import { formatEuroFromCents } from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { Product, ProductStatus } from "@/types/product";

type PendingDelete = {
  id: string;
  name: string;
};

export function ProductsList() {
  const t = useTranslations("adminProducts");
  const { toast } = useToast();
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const { data, isLoading, isError, isFetching } = useAdminProducts({
    status,
    search: query,
    page,
  });
  const deleteMutation = useDeleteProductMutation();

  const products = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? products.length;
  const showPagination = lastPage > 1;

  const applyFilters = () => {
    setPage(1);
    setQuery(search);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
      toast(t("deletedToast"));

      if (products.length <= 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch {
      toast(t("unableToDelete"), { variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="search" className="mb-2 block text-sm text-muted">
              {t("search")}
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-muted">
              {t("status")}
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as ProductStatus | "");
              }}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30 sm:w-44"
            >
              <option value="">{t("statusAll")}</option>
              <option value="draft">{t("statusDraft")}</option>
              <option value="published">{t("statusPublished")}</option>
            </select>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm text-foreground transition hover:border-white/30 hover:bg-white/5 sm:self-end"
          >
            {t("applyFilters")}
          </button>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
        >
          {t("newProduct")}
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">{t("loading")}</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-300">{t("unableToLoad")}</p>
      ) : null}

      {!isLoading && !isError && products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-muted">
          {t("empty")}
        </p>
      ) : null}

      {products.length > 0 ? (
        <div
          className={`overflow-x-auto rounded-2xl border border-white/10 ${isFetching ? "opacity-70" : ""}`}
        >
          <table className="min-w-[40rem] w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.03] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t("name")}</th>
                <th className="px-4 py-3 font-medium">{t("price")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="bg-black/20 transition hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(product)}
                      className="flex w-full items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                    >
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-white/[0.04]">
                        {product.primary_image_url ? (
                          <Image
                            src={product.primary_image_url}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted">{product.slug}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(product)}
                      className="text-left outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                    >
                      {formatEuroFromCents(product.price)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(product)}
                      className="text-left outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                    >
                      <span
                        className={
                          product.status === "published"
                            ? "text-emerald-300"
                            : "text-amber-200"
                        }
                      >
                        {product.status === "published"
                          ? t("statusPublished")
                          : t("statusDraft")}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-foreground transition hover:opacity-80"
                      >
                        {t("edit")}
                      </Link>
                      <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        onClick={() =>
                          setPendingDelete({ id: product.id, name: product.name })
                        }
                        className="text-red-300 transition hover:opacity-80 disabled:opacity-50"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {showPagination ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {t("pageOf", { current: currentPage, total: lastPage })}
            <span className="mx-2 text-white/20">·</span>
            {t("totalCount", { count: total })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-foreground transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("previousPage")}
            </button>
            <button
              type="button"
              disabled={currentPage >= lastPage || isFetching}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-foreground transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("nextPage")}
            </button>
          </div>
        </div>
      ) : null}

      <ProductPreviewModal
        key={previewProduct?.id ?? "closed"}
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

      <ConfirmModal
        open={pendingDelete !== null}
        title={t("deleteTitle")}
        description={t("confirmDelete", { name: pendingDelete?.name ?? "" })}
        confirmLabel={
          deleteMutation.isPending ? t("deleting") : t("deleteConfirm")
        }
        cancelLabel={t("cancel")}
        confirming={deleteMutation.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
