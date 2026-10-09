"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { ArrowMark } from "@/components/brand/arrow-mark";
import { Reveal } from "@/components/ui/reveal";
import { useCurrentUser } from "@/hooks/use-auth";
import { useHomepageCopy } from "@/hooks/use-homepage-copy";
import { subscribeNewsletter } from "@/lib/api/newsletter";
import { ApiError } from "@/lib/api/client";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import { pageShellClass } from "@/lib/layout";

type NewsletterSignupProps = {
  className?: string;
  id?: string;
};

/**
 * Guest-only newsletter signup. Copy from i18n; submission uses existing API.
 */
export function NewsletterSignup({
  className = "",
  id = "newsletter",
}: NewsletterSignupProps) {
  const t = useTranslations("newsletterSignup");
  const copy = useHomepageCopy();
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
      className={`grain-overlay relative bg-background ${className}`.trim()}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgba(32,56,44,0.35),transparent_55%)]"
      />
      <Reveal>
        <div
          className={pageShellClass(
            "shell",
            "flex flex-col gap-10 py-16 sm:flex-row sm:items-end sm:justify-between sm:py-20",
          )}
        >
          <div className="max-w-md">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
              {copy.newsletterEyebrow}
            </p>
            <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {copy.newsletterTitle}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {copy.newsletterSubtitle}
            </p>
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
                disabled={pending || Boolean(success)}
                className="w-full border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-border-strong disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={pending || !email.trim() || Boolean(success)}
                className="group inline-flex shrink-0 items-center justify-center gap-2 bg-foreground px-5 py-3.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
              >
                {pending ? t("subscribing") : t("subscribe")}
                {!pending ? (
                  <ArrowMark className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                ) : null}
              </button>
            </div>
            {success ? (
              <p className="mt-3 text-sm text-foreground/90" role="status">
                {success}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </Reveal>
    </section>
  );
}
