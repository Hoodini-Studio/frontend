"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  useCart,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/hooks/use-commerce";
import { formatEuroFromCents } from "@/lib/money";
import { localizedName } from "@/lib/i18n/localized";
import { normalizeLocale } from "@/lib/i18n/config";
import { useToast } from "@/providers/toast-provider";
import { CartSkeleton } from "@/components/ui/cart-skeleton";

export function CartPageContent() {
  const t = useTranslations("store");
  const locale = normalizeLocale(useLocale());
  const { toast } = useToast();
  const cartQuery = useCart();
  const updateItem = useUpdateCartItemMutation();
  const removeItem = useRemoveCartItemMutation();

  const cart = cartQuery.data;
  const pending = updateItem.isPending || removeItem.isPending;

  const handleQty = async (itemId: string, quantity: number) => {
    try {
      await updateItem.mutateAsync({ itemId, quantity });
    } catch {
      toast(t("cartUnableToUpdate"), { variant: "error" });
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem.mutateAsync(itemId);
      toast(t("cartRemoved"));
    } catch {
      toast(t("cartUnableToUpdate"), { variant: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-foreground">{t("cartTitle")}</h1>

      {cartQuery.isLoading ? <CartSkeleton /> : null}

      {cartQuery.isError ? (
        <p className="mt-8 text-sm text-red-300">{t("cartUnableToLoad")}</p>
      ) : null}

      {cart && cart.items.length === 0 ? (
        <div className="mt-10 space-y-4">
          <p className="text-muted">{t("cartEmpty")}</p>
          <Link href="/" className="inline-flex text-sm text-foreground underline-offset-4 hover:underline">
            {t("backToShop")}
          </Link>
        </div>
      ) : null}

      {cart && cart.items.length > 0 ? (
        <div className="mt-10 space-y-8">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {cart.items.map((item) => (
              <li key={item.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-white/5">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {item.name}
                  </Link>
                  {(item.color || item.size) ? (
                    <p className="mt-1 text-xs text-muted">
                      {[
                        item.color ? localizedName(item.color, locale) : null,
                        item.size?.name,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-muted">
                    {formatEuroFromCents(item.unit_price_cents)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={pending || item.quantity <= 1}
                    onClick={() => void handleQty(item.id, item.quantity - 1)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm text-foreground">{item.quantity}</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void handleQty(item.id, item.quantity + 1)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:bg-white/5 disabled:opacity-40"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void handleRemove(item.id)}
                    className="rounded-lg border border-red-300/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-300/10 disabled:opacity-60"
                  >
                    {t("cartRemove")}
                  </button>
                </div>
                <p className="text-sm font-medium text-foreground sm:w-24 sm:text-right">
                  {formatEuroFromCents(item.line_total_cents)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg text-foreground">
              {t("cartSubtotal")}:{" "}
              <span className="font-medium">{formatEuroFromCents(cart.subtotal_cents)}</span>
            </p>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              {t("cartCheckout")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
