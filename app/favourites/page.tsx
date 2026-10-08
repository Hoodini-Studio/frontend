import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FavouritesPageContent } from "@/components/favourites-page";

export const metadata: Metadata = {
  title: "Favourites",
  robots: { index: false, follow: false },
};

export default async function FavouritesPage() {
  const t = await getTranslations("store");

  return (
    <main>
      <span className="sr-only">{t("favouritesTitle")}</span>
      <FavouritesPageContent />
    </main>
  );
}
