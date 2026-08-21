"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import { subscribeNewsletter } from "@/lib/api/newsletter";
import { ApiError } from "@/lib/api/client";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";

function isHomePath(pathname: string) {
  return pathname === "/";
}

export function SiteFooter() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const { translateMessage } = useApiMessageTranslator();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await subscribeNewsletter(email.trim());
      setSuccess(translateMessage(response.message) || t("subscribed"));
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(translateMessage(err.message) || t("unableToSubscribe"));
      } else {
        setError(t("unableToSubscribe"));
      }
    } finally {
      setPending(false);
    }
  };

  if (isLoading || user || !isHomePath(pathname)) {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="font-display text-xl font-semibold text-foreground">
            {t("newsletterTitle")}
          </p>
          <p className="mt-2 text-sm text-muted">{t("newsletterSubtitle")}</p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="w-full max-w-md">
          <label htmlFor="footer-newsletter-email" className="sr-only">
            {t("email")}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="footer-newsletter-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={pending || !email.trim()}
              className="shrink-0 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? t("subscribing") : t("subscribe")}
            </button>
          </div>
          {success ? (
            <p className="mt-2 text-sm text-emerald-300">{success}</p>
          ) : null}
          {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
        </form>
      </div>
    </footer>
  );
}
