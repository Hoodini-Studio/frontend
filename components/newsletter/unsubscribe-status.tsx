"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api/client";

export function NewsletterUnsubscribeStatus() {
  const t = useTranslations("newsletter");
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const signature = searchParams.get("signature");
  const email = searchParams.get("email");
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  const ok = done || status === "ok";
  const canConfirm = !ok && !failed && status !== "error" && Boolean(signature) && Boolean(email);

  async function confirm() {
    setPending(true);
    setFailed(false);

    try {
      await apiRequest(`/api/newsletter/unsubscribe?${searchParams.toString()}`, {
        method: "POST",
      });
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  const title = ok
    ? t("unsubscribedTitle")
    : canConfirm
      ? t("confirmTitle")
      : t("unsubscribeErrorTitle");
  const body = ok
    ? t("unsubscribedBody")
    : canConfirm
      ? t("confirmBody")
      : t("unsubscribeErrorBody");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-[0.22em] text-muted">{t("eyebrow")}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted">{body}</p>
      {canConfirm ? (
        <button
          type="button"
          onClick={() => {
            void confirm();
          }}
          disabled={pending}
          className="mt-8 inline-flex w-fit rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:border-white/30 disabled:opacity-60"
        >
          {pending ? t("confirming") : t("confirmButton")}
        </button>
      ) : (
        <Link
          href="/"
          className="mt-8 inline-flex w-fit rounded-xl border border-white/15 px-4 py-2.5 text-sm text-foreground transition hover:border-white/30"
        >
          {t("backHome")}
        </Link>
      )}
    </main>
  );
}
