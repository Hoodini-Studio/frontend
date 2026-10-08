"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { PAGE_WIDTH } from "@/lib/layout";
import { INSTAGRAM_URL, SUPPORT_EMAIL } from "@/lib/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const year = 2026;

  return (
    <footer className="mt-auto border-t border-white/10">
      <div className={`mx-auto flex w-full ${PAGE_WIDTH.shell} flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="space-y-3">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-foreground">
            Hoodini Studio
          </p>
          <p className="text-sm text-muted">{t("copyright", { year })}</p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{t("legalHeading")}</p>
            <ul className="space-y-1.5 text-sm">
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

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{t("contactHeading")}</p>
            <ul className="space-y-1.5 text-sm">
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
      </div>
    </footer>
  );
}
