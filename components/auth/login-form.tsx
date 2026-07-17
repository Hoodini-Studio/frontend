"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLoginMutation } from "@/hooks/use-auth";
import { getPostAuthPath } from "@/lib/auth/roles";
import { ApiError } from "@/lib/api/client";
import { setLocaleCookie } from "@/lib/i18n/cookie";
import { normalizeLocale } from "@/lib/i18n/config";
import { isVerifyEmailRequiredError } from "@/lib/i18n/api-messages";
import { createLoginSchema, type LoginInput } from "@/schemas/auth";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";

export function LoginForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const { translateMessage, translateErrors } = useApiMessageTranslator();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const emailFromQuery = searchParams.get("email") ?? "";
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  const loginSchema = useMemo(() => createLoginSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromQuery,
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const response = await loginMutation.mutateAsync(values);
      setLocaleCookie(normalizeLocale(response.data.preferred_locale));
      router.push(getPostAuthPath(response.data));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setFormError(t("tooManyLoginAttempts"));
          return;
        }

        const emailError = error.errors.email?.[0] ?? "";
        if (isVerifyEmailRequiredError(emailError)) {
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }

        const localizedErrors = translateErrors(error.errors);
        Object.entries(localizedErrors).forEach(([field, messages]) => {
          if (field === "email" || field === "password") {
            setError(field, { message: messages[0] });
          }
        });

        setFormError(translateMessage(error.message));
        return;
      }

      setFormError(t("unableToSignIn"));
    }
  });

  return (
    <AuthShell
      title={t("signInTitle")}
      description={t("signInDescription")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
            {t("createOne")}
          </Link>
        </>
      }
    >
      {verified ? (
        <p className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          {t("emailVerified")}
        </p>
      ) : null}

      {reset ? (
        <p className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          {t("passwordUpdated")}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-foreground">
            {tCommon("email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-white/30"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-sm text-foreground">
              {tCommon("password")}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted transition hover:text-foreground"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-white/30"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
          className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || loginMutation.isPending ? t("signingIn") : tCommon("signIn")}
        </button>
      </form>
    </AuthShell>
  );
}
