"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { use, useState, type FormEvent } from "react";
import {
  useAdminUser,
  useDeleteAdminUserMutation,
  useUpdateAdminUserMutation,
} from "@/hooks/use-users";
import { useCurrentUser } from "@/hooks/use-auth";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Select } from "@/components/ui/select";
import { formatEuroFromCents } from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import type { CountryCode, Order } from "@/types/commerce";
import type { User } from "@/types/user";

type UserDetailEditorProps = {
  user: User;
  isSelf: boolean;
  orders: Order[];
  ordersMeta?: { current_page: number; last_page: number; total: number };
  ordersPage: number;
  onOrdersPageChange: (page: number) => void;
};

function UserDetailEditor({
  user,
  isSelf,
  orders,
  ordersMeta,
  ordersPage,
  onOrdersPageChange,
}: UserDetailEditorProps) {
  const t = useTranslations("adminUsers");
  const tOrders = useTranslations("adminOrders");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const updateMutation = useUpdateAdminUserMutation(user.id);
  const deleteMutation = useDeleteAdminUserMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [role, setRole] = useState<"admin" | "customer">(
    user.roles?.includes("admin") ? "admin" : "customer",
  );
  const [country, setCountry] = useState<CountryCode | "">(
    (user.shipping_country_code as CountryCode | null) ?? "",
  );
  const [city, setCity] = useState(user.shipping_city ?? "");
  const [address, setAddress] = useState(user.shipping_address_line ?? "");
  const [postal, setPostal] = useState(user.shipping_postal_code ?? "");
  const [marketingDrops, setMarketingDrops] = useState(Boolean(user.marketing_new_drops));
  const [marketingStudio, setMarketingStudio] = useState(
    Boolean(user.marketing_studio_updates),
  );

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateMutation.mutateAsync({
        name,
        phone: phone || null,
        role,
        shipping_country_code: country || null,
        shipping_city: city || null,
        shipping_address_line: address || null,
        shipping_postal_code: postal || null,
        marketing_new_drops: marketingDrops,
        marketing_studio_updates: marketingStudio,
      });
      toast(t("saved"), { variant: "success" });
    } catch {
      toast(t("saveFailed"), { variant: "error" });
    }
  };

  const onDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id);
      toast(t("deleted"), { variant: "success" });
      router.push("/admin/users");
    } catch {
      toast(t("deleteFailed"), { variant: "error" });
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/users" className="text-sm text-muted hover:text-foreground">
          ← {t("title")}
        </Link>
        {!isSelf ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-xl border border-red-400/40 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/10"
          >
            {t("deleteUser")}
          </button>
        ) : null}
      </div>

      <form onSubmit={(e) => void onSave(e)} className="space-y-4 border border-border bg-surface/40 p-5">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">{user.email}</h2>
          <p className="mt-1 text-sm text-muted">
            {t("joined")}:{" "}
            {new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(user.created_at))}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-muted">
            {t("name")}
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm text-muted">
            {t("phone")}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="user-role">
              {t("role")}
            </label>
            <Select
              id="user-role"
              value={role}
              disabled={isSelf}
              onChange={(next) => setRole(next as "admin" | "customer")}
              options={[
                { value: "customer", label: t("roleCustomer") },
                { value: "admin", label: t("roleAdmin") },
              ]}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="user-country">
              {t("shippingCountry")}
            </label>
            <Select
              id="user-country"
              value={country}
              onChange={(next) => setCountry(next as CountryCode | "")}
              options={[
                { value: "", label: "—" },
                { value: "XK", label: "XK" },
                { value: "AL", label: "AL" },
                { value: "MK", label: "MK" },
              ]}
            />
          </div>
          <label className="block text-sm text-muted">
            {t("shippingCity")}
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm text-muted">
            {t("shippingPostal")}
            <input
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm text-muted sm:col-span-2">
            {t("shippingAddress")}
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-foreground">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={marketingDrops}
              onChange={(e) => setMarketingDrops(e.target.checked)}
            />
            {t("marketingDrops")}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={marketingStudio}
              onChange={(e) => setMarketingStudio(e.target.checked)}
            />
            {t("marketingStudio")}
          </label>
        </div>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {updateMutation.isPending ? t("saving") : t("save")}
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">{t("ordersTitle")}</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">{t("ordersEmpty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/3 text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">{tOrders("number")}</th>
                  <th className="px-4 py-3 font-medium">{tOrders("status")}</th>
                  <th className="px-4 py-3 font-medium">{tOrders("total")}</th>
                  <th className="px-4 py-3 font-medium">{tOrders("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono">{order.number}</td>
                    <td className="px-4 py-3">{tOrders(`status_${order.status}`)}</td>
                    <td className="px-4 py-3">{formatEuroFromCents(order.total_cents)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {tOrders("view")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ordersMeta && ordersMeta.last_page > 1 ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={ordersPage <= 1}
              onClick={() => onOrdersPageChange(Math.max(1, ordersPage - 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              {t("previousPage")}
            </button>
            <button
              type="button"
              disabled={ordersPage >= ordersMeta.last_page}
              onClick={() => onOrdersPageChange(ordersPage + 1)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              {t("nextPage")}
            </button>
          </div>
        ) : null}
      </section>

      <ConfirmModal
        open={confirmDelete}
        title={t("deleteTitle")}
        description={t("deleteConfirm", { email: user.email })}
        confirmLabel={t("deleteUser")}
        cancelLabel={t("cancel")}
        confirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setConfirmDelete(false);
          }
        }}
        onConfirm={() => void onDelete()}
      />
    </div>
  );
}

export function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("adminUsers");
  const [ordersPage, setOrdersPage] = useState(1);
  const userQuery = useAdminUser(id, { page: ordersPage, perPage: 10 });
  const me = useCurrentUser();

  if (userQuery.isLoading) {
    return <p className="text-sm text-muted">{t("loading")}</p>;
  }

  if (userQuery.isError || !userQuery.data?.data) {
    return <p className="text-sm text-red-300">{t("unableToLoad")}</p>;
  }

  const user = userQuery.data.data;

  return (
    <UserDetailEditor
      key={`${user.id}-${user.updated_at}`}
      user={user}
      isSelf={me.data?.id === user.id}
      orders={userQuery.data.orders?.data ?? []}
      ordersMeta={userQuery.data.orders?.meta}
      ordersPage={ordersPage}
      onOrdersPageChange={setOrdersPage}
    />
  );
}
