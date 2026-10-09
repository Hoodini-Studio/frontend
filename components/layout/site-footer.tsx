"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { SectionLink } from "@/components/layout/section-link";
import { StarMark } from "@/components/brand/star-mark";
import { PAGE_WIDTH } from "@/lib/layout";
import { INSTAGRAM_URL, SUPPORT_EMAIL } from "@/lib/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const year = new Date().getFullYear();
  const isHome = pathname === "/";

  return (
    <footer
      className={`relative z-10 mt-auto overflow-hidden bg-background ${
        isHome ? "" : "border-t border-border"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brass/40 to-transparent"
      />
      <StarMark className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 text-foreground opacity-[0.035] sm:h-60 sm:w-60" />

      <div
        className={`relative mx-auto flex w-full ${PAGE_WIDTH.shell} flex-col gap-12 px-6 py-14 sm:py-16`}
      >
        <div className="grid gap-10 sm:grid-cols-[1.2fr_1fr] lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <LogoLockup markClassName="h-6 w-6" />
            <p className="font-display text-xl font-extrabold uppercase tracking-[0.08em] text-foreground sm:text-2xl">
              Hoodini
            </p>
            <p className="text-sm leading-relaxed text-muted">{t("tagline")}</p>
            <p className="text-xs leading-relaxed text-muted">{t("shippingNote")}</p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {t("shopHeading")}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <SectionLink
                  href="/#packs"
                  className="text-muted transition hover:text-foreground"
                >
                  {t("shopPacks")}
                </SectionLink>
              </li>
              <li>
                <SectionLink
                  href="/#the-drop"
                  className="text-muted transition hover:text-foreground"
                >
                  {t("shopDrop")}
                </SectionLink>
              </li>
              <li>
                <SectionLink
                  href="/#collections"
                  className="text-muted transition hover:text-foreground"
                >
                  {t("shopCollections")}
                </SectionLink>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {t("legalHeading")}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted transition hover:text-foreground"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted transition hover:text-foreground"
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {t("contactHeading")}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-muted transition hover:text-foreground"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              {INSTAGRAM_URL ? (
                <li>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted transition hover:text-foreground"
                  >
                    {t("instagram")}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">{t("copyright", { year })}</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted/80">
            {t("tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
