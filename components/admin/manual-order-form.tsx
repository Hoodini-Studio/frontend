"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useState, type FormEvent } from "react";
import { useAdminOrderSources, useCreateAdminOrderMutation } from "@/hooks/use-commerce";
import { useAdminBundles } from "@/hooks/use-bundles";
import { useAdminProducts } from "@/hooks/use-products";
import { formatEuroFromCents } from "@/lib/money";
import { useToast } from "@/providers/toast-provider";
import { Select } from "@/components/ui/select";
import type { CountryCode, ManualOrderLineInput } from "@/types/commerce";

const NEW_SOURCE = "__new__";

type DraftLine =
  | {
      key: string;
      type: "product";
      product_id: string;
      label: string;
      unit_price_cents: number;
      quantity: number;
      color_label: string;
      size_label: string;
    }
  | {
      key: string;
      type: "pack";
      bundle_id: string;
      label: string;
      unit_price_cents: number;
      quantity: number;
    }
  | {
      key: string;
      type: "custom";
      name: string;
      unit_price_cents: number;
      quantity: number;
    };

function newKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ManualOrderForm() {
  const t = useTranslations("adminOrders");
  const { toast } = useToast();
  const router = useRouter();
  const createMutation = useCreateAdminOrderMutation();
  const sourcesQuery = useAdminOrderSources();

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<CountryCode>("XK");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [sourceSelect, setSourceSelect] = useState("web");
  const [newSourceName, setNewSourceName] = useState("");
  const [externalRef, setExternalRef] = useState("");
  const [notes, setNotes] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [packSearch, setPackSearch] = useState("");
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [packMenuOpen, setPackMenuOpen] = useState(false);
  const [lines, setLines] = useState<DraftLine[]>([]);

  const deferredProductSearch = useDeferredValue(productSearch.trim());
  const deferredPackSearch = useDeferredValue(packSearch.trim());

  const productsQuery = useAdminProducts({
    status: "published",
    search: deferredProductSearch,
    perPage: 20,
  });
  const packsQuery = useAdminBundles({
    status: "published",
    search: deferredPackSearch,
    perPage: 20,
  });

  const products = productsQuery.data?.data ?? [];
  const packs = packsQuery.data?.data ?? [];

  const sourceSelectOptions = useMemo(() => {
    const sourceOptions = sourcesQuery.data?.data ?? [];
    return [
      ...sourceOptions.map((entry) => ({ value: entry.slug, label: entry.name })),
      { value: NEW_SOURCE, label: t("sourceAddNew") },
    ];
  }, [sourcesQuery.data?.data, t]);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unit_price_cents * line.quantity, 0),
    [lines],
  );

  const addProduct = (product: { id: string; name: string; price: number }) => {
    setLines((current) => [
      ...current,
      {
        key: newKey(),
        type: "product",
        product_id: product.id,
        label: product.name,
        unit_price_cents: product.price,
        quantity: 1,
        color_label: "",
        size_label: "",
      },
    ]);
    setProductSearch("");
    setProductMenuOpen(false);
  };

  const addPack = (pack: { id: string; name: string; price: number }) => {
    setLines((current) => [
      ...current,
      {
        key: newKey(),
        type: "pack",
        bundle_id: pack.id,
        label: pack.name,
        unit_price_cents: pack.price,
        quantity: 1,
      },
    ]);
    setPackSearch("");
    setPackMenuOpen(false);
  };

  const addCustom = () => {
    setLines((current) => [
      ...current,
      {
        key: newKey(),
        type: "custom",
        name: "",
        unit_price_cents: 0,
        quantity: 1,
      },
    ]);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (lines.length === 0) {
      toast(t("manualNeedItems"), { variant: "error" });
      return;
    }

    const source =
      sourceSelect === NEW_SOURCE ? newSourceName.trim() : sourceSelect;
    if (!source) {
      toast(t("sourceRequired"), { variant: "error" });
      return;
    }

    const items: ManualOrderLineInput[] = lines.map((line) => {
      if (line.type === "product") {
        return {
          type: "product",
          product_id: line.product_id,
          quantity: line.quantity,
          color_label: line.color_label || null,
          size_label: line.size_label || null,
        };
      }
      if (line.type === "pack") {
        return {
          type: "pack",
          bundle_id: line.bundle_id,
          quantity: line.quantity,
        };
      }
      return {
        type: "custom",
        name: line.name,
        unit_price_cents: line.unit_price_cents,
        quantity: line.quantity,
      };
    });

    try {
      const result = await createMutation.mutateAsync({
        customer_name: customerName,
        email: email.trim() || null,
        phone,
        country_code: country,
        city,
        address_line: address,
        postal_code: postal || null,
        notes: notes.trim() || null,
        source,
        external_ref: externalRef.trim() || null,
        items,
      });
      toast(t("manualCreated"), { variant: "success" });
      router.push(`/admin/orders/${result.data.id}`);
    } catch {
      toast(t("manualFailed"), { variant: "error" });
    }
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-8">
      <section className="space-y-4 border border-border bg-surface/40 p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">
            {t("manualCustomer")}
          </h2>
          <p className="text-xs text-muted">{t("requiredLegend")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-muted">
            {t("customer")} <span className="text-foreground">*</span>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
          <label className="block text-sm text-muted">
            {t("contact")} <span className="text-foreground">*</span>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
          <label className="block text-sm text-muted">
            {t("emailOptional")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
          <div className="space-y-2">
            <label className="mb-2 block text-sm text-muted" htmlFor="manual-source">
              {t("source")} <span className="text-foreground">*</span>
            </label>
            <Select
              id="manual-source"
              value={sourceSelect}
              onChange={(next) => setSourceSelect(next)}
              options={sourceSelectOptions}
            />
            {sourceSelect === NEW_SOURCE ? (
              <input
                required
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder={t("sourceNewPlaceholder")}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
              />
            ) : null}
          </div>
          <label className="block text-sm text-muted">
            {t("externalRef")}
            <input
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              placeholder={t("externalRefPlaceholder")}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
          <div>
            <label className="mb-2 block text-sm text-muted" htmlFor="manual-country">
              {t("country")} <span className="text-foreground">*</span>
            </label>
            <Select
              id="manual-country"
              value={country}
              onChange={(next) => setCountry(next as CountryCode)}
              options={[
                { value: "XK", label: "XK" },
                { value: "AL", label: "AL" },
                { value: "MK", label: "MK" },
              ]}
            />
          </div>
          <label className="block text-sm text-muted">
            {t("city")} <span className="text-foreground">*</span>
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
          <label className="block text-sm text-muted sm:col-span-2">
            {t("address")} <span className="text-foreground">*</span>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
          <label className="block text-sm text-muted">
            {t("postal")}
            <input
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
          <label className="block text-sm text-muted sm:col-span-2">
            {t("notes")}
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
            />
          </label>
        </div>
        <p className="text-xs text-muted">{t("manualShippingHint")}</p>
      </section>

      <section className="space-y-4 border border-border bg-surface/40 p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">{t("items")}</h2>
          <p className="text-xs text-muted">{t("itemsRequiredHint")}</p>
        </div>

        <div className="relative">
          <label className="mb-2 block text-sm text-muted" htmlFor="search-product">
            {t("addProduct")}
          </label>
          <input
            id="search-product"
            type="search"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setProductMenuOpen(true);
            }}
            onFocus={() => setProductMenuOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setProductMenuOpen(false), 150);
            }}
            placeholder={t("searchProductPlaceholder")}
            autoComplete="off"
            className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
          />
          {productMenuOpen ? (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-border bg-[#0d0d0d] shadow-lg">
              {productsQuery.isFetching ? (
                <li className="px-3 py-2 text-xs text-muted">{t("searchingItems")}</li>
              ) : null}
              {!productsQuery.isFetching && products.length === 0 ? (
                <li className="px-3 py-2 text-xs text-muted">{t("noProductMatches")}</li>
              ) : null}
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addProduct(product)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-white/5"
                  >
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 text-muted">
                      {formatEuroFromCents(product.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="relative">
          <label className="mb-2 block text-sm text-muted" htmlFor="search-pack">
            {t("addPack")}
          </label>
          <input
            id="search-pack"
            type="search"
            value={packSearch}
            onChange={(e) => {
              setPackSearch(e.target.value);
              setPackMenuOpen(true);
            }}
            onFocus={() => setPackMenuOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setPackMenuOpen(false), 150);
            }}
            placeholder={t("searchPackPlaceholder")}
            autoComplete="off"
            className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-border-strong"
          />
          {packMenuOpen ? (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-border bg-[#0d0d0d] shadow-lg">
              {packsQuery.isFetching ? (
                <li className="px-3 py-2 text-xs text-muted">{t("searchingItems")}</li>
              ) : null}
              {!packsQuery.isFetching && packs.length === 0 ? (
                <li className="px-3 py-2 text-xs text-muted">{t("noPackMatches")}</li>
              ) : null}
              {packs.map((pack) => (
                <li key={pack.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addPack(pack)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-white/5"
                  >
                    <span className="truncate">{pack.name}</span>
                    <span className="shrink-0 text-muted">
                      {formatEuroFromCents(pack.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="button"
          onClick={addCustom}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-sm"
        >
          {t("addCustom")}
        </button>

        <ul className="space-y-3">
          {lines.map((line) => (
            <li key={line.key} className="border border-border bg-background/50 p-3">
              {line.type === "custom" ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_8rem_5rem_auto]">
                  <input
                    required
                    value={line.name}
                    placeholder={t("customName")}
                    onChange={(e) =>
                      setLines((current) =>
                        current.map((entry) =>
                          entry.key === line.key && entry.type === "custom"
                            ? { ...entry, name: e.target.value }
                            : entry,
                        ),
                      )
                    }
                    className="border border-border bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    required
                    value={line.unit_price_cents}
                    onChange={(e) =>
                      setLines((current) =>
                        current.map((entry) =>
                          entry.key === line.key && entry.type === "custom"
                            ? { ...entry, unit_price_cents: Number(e.target.value) || 0 }
                            : entry,
                        ),
                      )
                    }
                    className="border border-border bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      setLines((current) =>
                        current.map((entry) =>
                          entry.key === line.key
                            ? { ...entry, quantity: Math.max(1, Number(e.target.value) || 1) }
                            : entry,
                        ),
                      )
                    }
                    className="border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setLines((current) => current.filter((entry) => entry.key !== line.key))}
                    className="text-sm text-red-300"
                  >
                    {t("remove")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{line.label}</p>
                    <p className="text-xs text-muted">
                      {line.type === "product" ? t("lineProduct") : t("linePack")} ·{" "}
                      {formatEuroFromCents(line.unit_price_cents)}
                    </p>
                    {line.type === "product" ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          value={line.color_label}
                          placeholder={t("colorLabel")}
                          onChange={(e) =>
                            setLines((current) =>
                              current.map((entry) =>
                                entry.key === line.key && entry.type === "product"
                                  ? { ...entry, color_label: e.target.value }
                                  : entry,
                              ),
                            )
                          }
                          className="border border-border bg-background px-2 py-1 text-xs"
                        />
                        <input
                          value={line.size_label}
                          placeholder={t("sizeLabel")}
                          onChange={(e) =>
                            setLines((current) =>
                              current.map((entry) =>
                                entry.key === line.key && entry.type === "product"
                                  ? { ...entry, size_label: e.target.value }
                                  : entry,
                              ),
                            )
                          }
                          className="border border-border bg-background px-2 py-1 text-xs"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        setLines((current) =>
                          current.map((entry) =>
                            entry.key === line.key
                              ? { ...entry, quantity: Math.max(1, Number(e.target.value) || 1) }
                              : entry,
                          ),
                        )
                      }
                      className="w-20 border border-border bg-background px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setLines((current) => current.filter((entry) => entry.key !== line.key))
                      }
                      className="text-sm text-red-300"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          {t("subtotal")}: {formatEuroFromCents(subtotal)}
        </p>
      </section>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {createMutation.isPending ? t("creating") : t("createOrder")}
      </button>
    </form>
  );
}
