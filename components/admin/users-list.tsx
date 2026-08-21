"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-users";
import { TableSkeleton } from "@/components/ui/table-skeleton";

function formatRoleLabel(
  role: string,
  t: ReturnType<typeof useTranslations<"adminUsers">>,
): string {
  if (role === "admin") {
    return t("roleAdmin");
  }

  if (role === "customer") {
    return t("roleCustomer");
  }

  return role;
}

function formatJoinedAt(value: string, locale: string): string {
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

export function UsersList() {
  const t = useTranslations("adminUsers");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useAdminUsers({
    search: query,
    role,
    page,
  });

  const users = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.current_page ?? page;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? users.length;
  const showPagination = lastPage > 1;

  const applyFilters = () => {
    setPage(1);
    setQuery(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="user-search" className="mb-2 block text-sm text-muted">
            {t("search")}
          </label>
          <input
            id="user-search"
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
          <label htmlFor="user-role" className="mb-2 block text-sm text-muted">
            {t("role")}
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-foreground outline-none transition focus:border-white/30 sm:w-44"
          >
            <option value="">{t("roleAll")}</option>
            <option value="admin">{t("roleAdmin")}</option>
            <option value="customer">{t("roleCustomer")}</option>
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

      {isLoading ? <TableSkeleton rows={6} columns={4} /> : null}
      {isError ? <p className="text-sm text-red-300">{t("unableToLoad")}</p> : null}

      {!isLoading && !isError && users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-muted">
          {t("empty")}
        </p>
      ) : null}

      {users.length > 0 ? (
        <div
          className={`overflow-x-auto rounded-2xl border border-white/10 ${isFetching ? "opacity-70" : ""}`}
        >
          <table className="min-w-160 w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/3 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t("name")}</th>
                <th className="px-4 py-3 font-medium">{t("email")}</th>
                <th className="px-4 py-3 font-medium">{t("role")}</th>
                <th className="px-4 py-3 font-medium">{t("joined")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="bg-black/20">
                  <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {(user.roles.length > 0 ? user.roles : ["—"]).map((roleName) => (
                        <span
                          key={`${user.id}-${roleName}`}
                          className={
                            roleName === "admin"
                              ? "text-amber-200"
                              : roleName === "customer"
                                ? "text-emerald-300"
                                : "text-muted"
                          }
                        >
                          {formatRoleLabel(roleName, t)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatJoinedAt(user.created_at, locale)}
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
    </div>
  );
}
