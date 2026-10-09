"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { ArrowMark } from "@/components/brand/arrow-mark";

function SuccessInner() {
  const t = useTranslations("store");
  const params = useSearchParams();
  const number = params.get("number");

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center sm:py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Hoodini Studio</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t("checkoutSuccessTitle")}
      </h1>
      <p className="mt-4 text-muted">{t("checkoutSuccessMessage")}</p>
      {number ? (
        <p className="mt-8 border border-border bg-surface px-4 py-3 font-mono text-lg text-foreground">
          {number}
        </p>
      ) : null}
      <Link
        href="/#the-drop"
        className="group mt-10 inline-flex items-center gap-2 bg-foreground px-5 py-3.5 text-sm font-medium text-background transition hover:opacity-90"
      >
        <ArrowMark className="h-3.5 w-3.5 rotate-180 transition group-hover:-translate-x-0.5" />
        {t("backToShop")}
      </Link>
    </div>
  );
}

export function CheckoutSuccessContent() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
