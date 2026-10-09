"use client";

import { useTranslations } from "next-intl";

/** Static homepage section copy from next-intl (code-managed, not CMS). */
export function useHomepageCopy() {
  const t = useTranslations("home");
  const tStore = useTranslations("store");
  const tNews = useTranslations("newsletterSignup");

  return {
    heroImageUrl: "/images/hero-fashion.jpg",
    heroEyebrow: t("heroEyebrow"),
    heroHeadline: `${t("heroLine1")}\n${t("heroLine2")}`,
    heroSupport: t("heroSupport"),
    heroCtaLabel: t("heroCta"),
    heroCtaHref: "#the-drop",
    heroSecondaryLabel: t("heroSecondary"),
    heroSecondaryHref: "#packs",
    packsEyebrow: t("packsEyebrow"),
    packsTitle: tStore("packsTitle"),
    packsSubtitle: t("packsSubtitle"),
    dropTitle: t("dropTitle"),
    dropSubtitle: t("dropSubtitle"),
    collectionsTitle: t("collectionsTitle"),
    collectionsSubtitle: t("collectionsSubtitle"),
    philosophyEyebrow: t("philosophyEyebrow"),
    philosophyHeadline: `${t("philosophyLine1")}\n${t("philosophyLine2")}\n${t("philosophyLine3")}`,
    philosophyBody: t("philosophyBody"),
    philosophyCtaLabel: t("philosophyCta"),
    philosophyCtaHref: "#the-drop",
    newsletterEyebrow: tNews("eyebrow"),
    newsletterTitle: tNews("title"),
    newsletterSubtitle: tNews("subtitle"),
  };
}
