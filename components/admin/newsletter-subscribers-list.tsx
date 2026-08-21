"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { downloadAdminNewsletterEmails, listAdminNewsletter } from "@/lib/api/newsletter";
import { TableSkeleton } from "@/components/ui/table-skeleton";

function formatDate(value: string | null, locale: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function NewsletterSubscribersList() {
  const t = useTranslations("adminNewsletter");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | "active" | "unsubscribed">("");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin", "newsletter", query, status, page],
    queryFn: async ({ signal }) =>
      listAdminNewsletter({
        search: query || undefined,
        status: status || undefined,
        page,
        signal,
      }),
  });

  const subscribers = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? subscribers.length;
  const showPagination = lastPage > 1;
  const canDownload =
    !listQuery.isLoading && !listQuery.isError && total > 0 && !downloading;

  const applyFilters = () => {
    setPage(1);
    setQuery(search);
  };

  const downloadEmails = async () => {
    if (!canDownload) {
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      await downloadAdminNewsletterEmails({
        search: query || undefined,
        status: status || undefined,
      });
    } catch {
      setDownloadError(t("downloadFailed"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="newsletter-search" className="mb-2 block text-sm text-muted">
            {t("search")}
          </label>
          <input
            id="newsletter-search"
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
          <label htmlFor="newsletter-status" className="mb-2 block text-sm text-muted">
            {t("status")}
          </label>
          <select
            id="newsletter-status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as "" | "active" | "unsubscribed");
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30 sm:w-44"
          >
            <option value="">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="unsubscribed">{t("statusUnsubscribed")}</option>
          </select>
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-xl border border-white/15 px-4 py-3 text-sm text-foreground transition hover:bg-white/5"
        >
          {t("apply")}
        </button>
        <button
          type="button"
          onClick={() => void downloadEmails()}
          disabled={!canDownload}
          className="rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {downloading ? t("downloading") : t("downloadEmails")}
        </button>
      </div>

      {downloadError ? <p className="text-sm text-red-300">{downloadError}</p> : null}

      {listQuery.isLoading ? <TableSkeleton rows={5} columns={3} /> : null}
      {listQuery.isError ? (
        <p className="text-sm text-red-300">{t("unableToLoad")}</p>
      ) : null}

      {!listQuery.isLoading && subscribers.length === 0 ? (
        <p className="text-sm text-muted">{t("empty")}</p>
      ) : null}

      {subscribers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-white/10 text-muted">
              <tr>
                <th className="px-2 py-3 font-medium">{t("email")}</th>
                <th className="px-2 py-3 font-medium">{t("status")}</th>
                <th className="px-2 py-3 font-medium">{t("subscribedAt")}</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-white/5">
                  <td className="px-2 py-3 text-foreground">{subscriber.email}</td>
                  <td className="px-2 py-3 text-muted">
                    {subscriber.is_active ? t("statusActive") : t("statusUnsubscribed")}
                  </td>
                  <td className="px-2 py-3 text-muted">
                    {formatDate(subscriber.subscribed_at, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {showPagination ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentPage <= 1 || listQuery.isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {t("prev")}
          </button>
          <p className="text-sm text-muted">
            {t("page", { current: currentPage, last: lastPage })}
          </p>
          <button
            type="button"
            disabled={currentPage >= lastPage || listQuery.isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {t("next")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
