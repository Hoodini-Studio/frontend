"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useAdminBundles, useDeleteBundleMutation } from "@/hooks/use-bundles";
import { formatEuroFromCents } from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { BundleStatus } from "@/types/bundle";

type PendingDelete = {
  id: string;
  name: string;
};

export function PacksList() {
  const t = useTranslations("adminPacks");
  const { toast } = useToast();
  const [status, setStatus] = useState<BundleStatus | "">("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const { data, isLoading, isError, isFetching } = useAdminBundles({
    status,
    search: query,
    page,
  });
  const deleteMutation = useDeleteBundleMutation();

  const packs = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? packs.length;
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

      if (packs.length <= 1 && page > 1) {
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
            <Select
              id="status"
              value={status}
              onChange={(next) => {
                setPage(1);
                setStatus(next as BundleStatus | "");
              }}
              className="sm:w-44"
              options={[
                { value: "", label: t("statusAll") },
                { value: "draft", label: t("statusDraft") },
                { value: "published", label: t("statusPublished") },
              ]}
            />
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
          href="/admin/packs/new"
          className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
        >
          {t("newPack")}
        </Link>
      </div>

      {isLoading ? <TableSkeleton rows={6} columns={4} /> : null}

      {isError ? <p className="text-sm text-red-300">{t("unableToLoad")}</p> : null}

      {!isLoading && !isError && packs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-muted">
          {t("empty")}
        </p>
      ) : null}

      {packs.length > 0 ? (
        <div
          className={`overflow-x-auto rounded-2xl border border-white/10 ${isFetching ? "opacity-70" : ""}`}
        >
          <table className="min-w-160 w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/3 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t("name")}</th>
                <th className="px-4 py-3 font-medium">{t("price")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {packs.map((pack) => {
                const itemCount = pack.item_count ?? pack.items?.length ?? 0;

                return (
                  <tr key={pack.id} className="bg-black/20 transition hover:bg-white/3">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-white/4">
                          {pack.primary_image_url ? (
                            <Image
                              src={pack.primary_image_url}
                              alt=""
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{pack.name}</p>
                          <p className="text-xs text-muted">{pack.slug}</p>
                          <p className="mt-1 text-xs text-muted">
                            {t("itemCount", { count: itemCount })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatEuroFromCents(pack.price)}
                      {pack.suggested_price_cents != null &&
                      pack.suggested_price_cents !== pack.price ? (
                        <p className="text-xs text-muted">
                          {t("suggestedShort", {
                            amount: formatEuroFromCents(pack.suggested_price_cents),
                          })}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          pack.status === "published" ? "text-emerald-300" : "text-amber-200"
                        }
                      >
                        {pack.status === "published" ? t("statusPublished") : t("statusDraft")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/packs/${pack.id}/edit`}
                          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
                        >
                          {t("edit")}
                        </Link>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => setPendingDelete({ id: pack.id, name: pack.name })}
                          className="rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
                        >
                          {t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      <ConfirmModal
        open={pendingDelete !== null}
        title={t("deleteTitle")}
        description={t("confirmDelete", { name: pendingDelete?.name ?? "" })}
        confirmLabel={deleteMutation.isPending ? t("deleting") : t("deleteConfirm")}
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
