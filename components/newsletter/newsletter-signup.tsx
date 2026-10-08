"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import { subscribeNewsletter } from "@/lib/api/newsletter";
import { ApiError } from "@/lib/api/client";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";

type NewsletterSignupProps = {
  className?: string;
  /** Defaults to a section suitable for mid-page placement. */
  id?: string;
};

/**
 * Guest-only newsletter signup block. Reusable on home, mid-catalog, etc.
 * Hidden for logged-in users (they use account email preferences).
 */
export function NewsletterSignup({
  className = "",
  id = "newsletter",
}: NewsletterSignupProps) {
  const t = useTranslations("newsletterSignup");
  const { data: user, isLoading } = useCurrentUser();
  const { translateMessage } = useApiMessageTranslator();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || user) {
    return null;
  }

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

  return (
    <section
      id={id}
      className={`border-y border-white/10 bg-white/[0.02] ${className}`.trim()}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-end sm:justify-between sm:py-16">
        <div className="max-w-md">
          <p className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {t("title")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("subtitle")}</p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="w-full max-w-md">
          <label htmlFor={`${id}-email`} className="sr-only">
            {t("email")}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`${id}-email`}
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
          {success ? <p className="mt-2 text-sm text-emerald-300">{success}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
