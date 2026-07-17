"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { useRegisterMutation } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { createRegisterSchema, type RegisterInput } from "@/schemas/auth";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const { translateMessage, translateErrors } = useApiMessageTranslator();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();

  const registerSchema = useMemo(() => createRegisterSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await registerMutation.mutateAsync(values);
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setFormError(t("tooManyRegisterAttempts"));
          return;
        }

        const localizedErrors = translateErrors(error.errors);
        Object.entries(localizedErrors).forEach(([field, messages]) => {
          if (
            field === "name" ||
            field === "email" ||
            field === "password" ||
            field === "password_confirmation"
          ) {
            setError(field, { message: messages[0] });
          }
        });

        setFormError(translateMessage(error.message));
        return;
      }

      setFormError(t("unableToRegister"));
    }
  });

  return (
    <AuthShell
      title={t("createAccountTitle")}
      description={t("createAccountDescription")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            {tCommon("signIn")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm text-foreground">
            {tCommon("name")}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-white/30"
            {...register("name")}
          />
          {errors.name ? <p className="text-sm text-red-400">{errors.name.message}</p> : null}
        </div>

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
          {errors.email ? <p className="text-sm text-red-400">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-foreground">
            {tCommon("password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-white/30"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password_confirmation" className="block text-sm text-foreground">
            {tCommon("confirmPassword")}
          </label>
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-white/30"
            {...register("password_confirmation")}
          />
          {errors.password_confirmation ? (
            <p className="text-sm text-red-400">{errors.password_confirmation.message}</p>
          ) : null}
        </div>

        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || registerMutation.isPending ? t("creatingAccount") : t("createAccount")}
        </button>
      </form>
    </AuthShell>
  );
}
