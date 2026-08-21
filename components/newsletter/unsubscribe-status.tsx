"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function NewsletterUnsubscribeStatus() {
  const t = useTranslations("newsletter");
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const ok = status === "ok";

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-[0.22em] text-muted">{t("eyebrow")}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
        {ok ? t("unsubscribedTitle") : t("unsubscribeErrorTitle")}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {ok ? t("unsubscribedBody") : t("unsubscribeErrorBody")}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex w-fit rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:border-white/30"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
