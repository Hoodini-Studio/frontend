"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAdmin } from "@/lib/auth/roles";

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
    <main className="mx-auto max-w-2xl px-6 py-10 animate-[fade-in-up_0.45s_ease-out]">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">{t("eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-md text-muted">{t("hubSubtitle")}</p>
      </div>

      <nav aria-label={t("title")} className="border-y border-white/10">
        <ul>
          {items.map((item) => (
            <li key={item.href} className="border-b border-white/10 last:border-b-0">
              <Link
                href={item.href}
                className="group flex items-center justify-between gap-4 py-5 transition hover:bg-white/5"
              >
                <span className="min-w-0">
                  <span className="block font-display text-lg font-semibold text-foreground transition group-hover:translate-x-0.5">
                    {item.title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted">
                    {item.hint}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
