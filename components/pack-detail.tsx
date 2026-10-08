"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { use, useEffect, useRef, useState } from "react";
import { useAddCartItemMutation } from "@/hooks/use-commerce";
import { usePublishedBundle } from "@/hooks/use-bundles";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizedDescription, localizedName } from "@/lib/i18n/localized";
import { formatEuroFromCents } from "@/lib/money";
import { pageShellClass } from "@/lib/layout";
import { useToast } from "@/providers/toast-provider";
import { ProductDetailSkeleton } from "@/components/ui/product-detail-skeleton";

type Selection = { colorId: string | null; sizeId: string | null };

type PackDetailProps = {
  slug: string;
};

export function PackDetail({ slug }: PackDetailProps) {
  const t = useTranslations("store");
  const locale = normalizeLocale(useLocale());
  const { toast } = useToast();
  const { data, isLoading, isError } = usePublishedBundle(slug);
  const pack = data?.data;
  const addToCart = useAddCartItemMutation();
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [justAdded, setJustAdded] = useState(false);
  const addedResetRef = useRef<number | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const items = [...(pack?.items ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  if (pack && pack.id !== syncedFor) {
    setSyncedFor(pack.id);
    setSelections(
      Object.fromEntries(
        pack.items.map((item) => [
          item.id,
          {
            colorId: item.colors.length === 1 ? item.colors[0].id : null,
            sizeId: item.sizes.length === 1 ? item.sizes[0].id : null,
          },
        ]),
      ),
    );
    setMissing(new Set());
  }

  useEffect(() => {
    return () => {
      if (addedResetRef.current != null) {
        window.clearTimeout(addedResetRef.current);
      }
    };
  }, []);

  const select = (itemId: string, patch: Partial<Selection>) => {
    setSelections((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? { colorId: null, sizeId: null }),
        ...patch,
      },
    }));
    setMissing((current) => {
      if (!current.has(itemId)) {
        return current;
      }

      const next = new Set(current);
      next.delete(itemId);
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!pack || addToCart.isPending) {
      return;
    }

    const incomplete = items.filter((item) => {
      const selection = selections[item.id];
      return (
        (item.colors.length > 0 && !selection?.colorId) ||
        (item.sizes.length > 0 && !selection?.sizeId)
      );
    });

    if (incomplete.length > 0) {
      setMissing(new Set(incomplete.map((item) => item.id)));
      itemRefs.current[incomplete[0].id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      return;
    }

    setMissing(new Set());
    setJustAdded(false);

    void addToCart
      .mutateAsync({
        bundle_id: pack.id,
        quantity: 1,
        selections: items.map((item) => ({
          bundle_item_id: item.id,
          color_id: selections[item.id]?.colorId ?? null,
          size_id: selections[item.id]?.sizeId ?? null,
        })),
      })
      .then(() => {
        setJustAdded(true);

        if (addedResetRef.current != null) {
          window.clearTimeout(addedResetRef.current);
        }

        addedResetRef.current = window.setTimeout(() => {
          setJustAdded(false);
          addedResetRef.current = null;
        }, 1600);
      })
      .catch(() => toast(t("unableToAddToCart"), { variant: "error" }));
  };

  const coverUrl =
    pack?.primary_image_url ??
    items.find((item) => item.product?.primary_image_url)?.product?.primary_image_url ??
    null;
  const description = pack ? localizedDescription(pack, locale) : null;
  const showSuggested =
    pack != null &&
    pack.suggested_price_cents != null &&
    pack.suggested_price_cents > pack.price;

  return (
    <div className={pageShellClass("shell", "min-h-[calc(100vh-4rem)] py-12 sm:py-16")}>
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        {t("backToShop")}
      </Link>

      <div className="mt-8">
        {isLoading ? <ProductDetailSkeleton /> : null}

        {isError || (!isLoading && !pack) ? (
          <div className="max-w-md">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {t("packNotFoundTitle")}
            </h1>
            <p className="mt-3 text-muted">{t("packNotFoundMessage")}</p>
            <Link
              href="/"
              className="mt-6 inline-flex text-sm text-foreground underline-offset-4 hover:underline"
            >
              {t("backToShop")}
            </Link>
          </div>
        ) : null}

        {pack ? (
          <article className="grid gap-10 lg:grid-cols-2">
            <div className="relative aspect-4/5 self-start overflow-hidden bg-linear-to-b from-white/7 to-white/2">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={pack.name}
                  fill
                  unoptimized
                  loading="eager"
                  fetchPriority="high"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : null}
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">{t("packLabel")}</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {pack.name}
              </h1>
              <p className="mt-4 flex flex-wrap items-baseline gap-3 text-xl text-foreground">
                {formatEuroFromCents(pack.price)}
                {showSuggested ? (
                  <span className="text-sm text-muted">
                    {t("packSuggested", {
                      amount: formatEuroFromCents(pack.suggested_price_cents!),
                    })}
                  </span>
                ) : null}
              </p>

              {description ? (
                <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-muted">
                  {description}
                </p>
              ) : null}

              <section className="mt-8">
                <h2 className="text-xs uppercase tracking-[0.18em] text-muted">
                  {t("packIncludes")}
                </h2>
                <p className="mt-2 text-sm text-muted">{t("packSelectOptions")}</p>

                <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                  {items.map((item) => {
                    const selection = selections[item.id];
                    const needsAttention = missing.has(item.id);

                    return (
                      <li
                        key={item.id}
                        ref={(node) => {
                          itemRefs.current[item.id] = node;
                        }}
                        className="flex gap-4 py-5"
                      >
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-white/5">
                          {item.product?.primary_image_url ? (
                            <Image
                              src={item.product.primary_image_url}
                              alt=""
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <p className="font-medium text-foreground">
                            {item.product?.name}
                            {item.quantity > 1 ? (
                              <span className="text-muted"> × {item.quantity}</span>
                            ) : null}
                          </p>

                          {item.colors.length > 0 ? (
                            <div>
                              <p
                                className={`text-xs uppercase tracking-[0.18em] ${
                                  needsAttention && !selection?.colorId
                                    ? "text-foreground"
                                    : "text-muted"
                                }`}
                              >
                                {t("colorLabel")}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.colors.map((color) => {
                                  const selected = selection?.colorId === color.id;

                                  return (
                                    <button
                                      key={color.id}
                                      type="button"
                                      aria-pressed={selected}
                                      onClick={() => select(item.id, { colorId: color.id })}
                                      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-sm transition ${
                                        selected
                                          ? "border-white/40 bg-white/10 text-foreground"
                                          : needsAttention && !selection?.colorId
                                            ? "border-white/35 text-foreground"
                                            : "border-white/15 text-foreground hover:border-white/30"
                                      }`}
                                    >
                                      <span
                                        className="h-3.5 w-3.5 rounded-full border border-white/20"
                                        style={{ backgroundColor: color.hex }}
                                        aria-hidden="true"
                                      />
                                      {localizedName(color, locale)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {item.sizes.length > 0 ? (
                            <div>
                              <p
                                className={`text-xs uppercase tracking-[0.18em] ${
                                  needsAttention && !selection?.sizeId
                                    ? "text-foreground"
                                    : "text-muted"
                                }`}
                              >
                                {t("sizeLabel")}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.sizes.map((size) => {
                                  const selected = selection?.sizeId === size.id;

                                  return (
                                    <button
                                      key={size.id}
                                      type="button"
                                      aria-pressed={selected}
                                      onClick={() => select(item.id, { sizeId: size.id })}
                                      className={`min-w-10 border px-3 py-1.5 text-center text-sm transition ${
                                        selected
                                          ? "border-white/40 bg-white/10 text-foreground"
                                          : needsAttention && !selection?.sizeId
                                            ? "border-white/35 text-foreground"
                                            : "border-white/15 text-foreground hover:border-white/30"
                                      }`}
                                    >
                                      {size.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {missing.size > 0 ? (
                <p
                  role="status"
                  className="mt-5 text-sm text-foreground animate-[fade-in-up_0.25s_ease-out]"
                >
                  {t("packSelectOptions")}
                </p>
              ) : null}

              <button
                type="button"
                disabled={addToCart.isPending}
                onClick={handleAddToCart}
                aria-live="polite"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition disabled:opacity-60 sm:min-w-44 sm:w-auto ${
                  justAdded
                    ? "border border-white bg-black text-white"
                    : "border border-transparent bg-foreground text-background hover:opacity-90"
                }`}
              >
                {addToCart.isPending
                  ? t("addingToCart")
                  : justAdded
                    ? t("addedToCart")
                    : t("packAddToCart")}
              </button>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}

export function PackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return <PackDetail slug={slug} />;
}
