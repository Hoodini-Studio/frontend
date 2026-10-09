import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartPageContent } from "@/components/cart-page";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const t = await getTranslations("store");

  return (
    <main className="flex flex-1 flex-col">
      <span className="sr-only">{t("cartTitle")}</span>
      <CartPageContent />
    </main>
  );
}
