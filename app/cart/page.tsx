import { getTranslations } from "next-intl/server";
import { CartPageContent } from "@/components/cart-page";

export default async function CartPage() {
  const t = await getTranslations("store");

  return (
    <main>
      <span className="sr-only">{t("cartTitle")}</span>
      <CartPageContent />
    </main>
  );
}
