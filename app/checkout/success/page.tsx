"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

function SuccessInner() {
  const t = useTranslations("store");
  const params = useSearchParams();
  const number = params.get("number");

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        {t("checkoutSuccessTitle")}
      </h1>
      <p className="mt-4 text-muted">{t("checkoutSuccessMessage")}</p>
      {number ? (
        <p className="mt-6 font-mono text-lg text-foreground">{number}</p>
      ) : null}
      <Link
        href="/"
        className="mt-10 inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm text-foreground transition hover:bg-white/5"
      >
        {t("backToShop")}
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <SuccessInner />
      </Suspense>
    </main>
  );
}
