"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowMark } from "@/components/brand/arrow-mark";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAdmin } from "@/lib/auth/roles";
import { pageShellClass } from "@/lib/layout";

type HubItem = {
  href: string;
  title: string;
  hint: string;
};

export function SettingsHub() {
  const t = useTranslations("settings");
  const { data: user } = useCurrentUser();

  if (!user) {
    return null;
  }

  const languageLabel =
    user.preferred_locale === "sq" ? t("albanian") : t("english");

  const addressHint = [user.shipping_city, user.shipping_country_code]
    .filter(Boolean)
    .join(", ");

  const items: HubItem[] = [
    {
      href: "/account-settings/profile",
      title: t("hubProfile"),
      hint: user.email,
    },
    {
      href: "/account-settings/language",
      title: t("hubLanguage"),
      hint: languageLabel,
    },
    ...(!isAdmin(user)
      ? [
          {
            href: "/account-settings/emails",
            title: t("hubEmails"),
            hint: t("hubEmailsHint"),
          },
          {
            href: "/account-settings/address",
            title: t("hubAddress"),
            hint: addressHint || t("hubAddressEmpty"),
          },
        ]
      : []),
    {
      href: "/account-settings/password",
      title: t("hubPassword"),
      hint: t("hubPasswordHint"),
    },
  ];

  return (
    <main className={pageShellClass("shell", "py-12 sm:py-16")}>
      <div className="mb-10 max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{t("eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          {t("hubSubtitle")}
        </p>
      </div>

      <nav aria-label={t("title")} className="border-y border-border">
        <ul>
          {items.map((item) => (
            <li key={item.href} className="border-b border-border last:border-b-0">
              <Link
                href={item.href}
                className="group flex items-center justify-between gap-4 py-5 transition hover:bg-surface/60 sm:px-2"
              >
                <span className="min-w-0">
                  <span className="block font-display text-lg font-bold tracking-tight text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted">
                    {item.hint}
                  </span>
                </span>
                <ArrowMark className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
