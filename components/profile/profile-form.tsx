"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useChangePasswordMutation,
  useCurrentUser,
  useUpdatePreferredLocaleMutation,
} from "@/hooks/use-auth";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import { ApiError } from "@/lib/api/client";
import { setLocaleCookie } from "@/lib/i18n/cookie";
import { type AppLocale, locales } from "@/lib/i18n/config";
import {
  createChangePasswordSchema,
  type ChangePasswordInput,
} from "@/schemas/auth";

export function ProfileForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const { translateMessage, translateErrors } = useApiMessageTranslator();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localeError, setLocaleError] = useState(false);
  const [localeSuccess, setLocaleSuccess] = useState(false);
  const changePasswordMutation = useChangePasswordMutation();
  const updateLocaleMutation = useUpdatePreferredLocaleMutation();

  const changePasswordSchema = useMemo(
    () => createChangePasswordSchema(tValidation),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await changePasswordMutation.mutateAsync(values);
      setSuccessMessage(translateMessage(response.message));
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        const localizedErrors = translateErrors(error.errors);
        Object.entries(localizedErrors).forEach(([field, messages]) => {
          if (
            field === "current_password" ||
            field === "password" ||
            field === "password_confirmation"
          ) {
            setError(field, { message: messages[0] });
          }
        });

        setFormError(translateMessage(error.message));
        return;
      }

      setFormError(t("unableToChangePassword"));
    }
  });

  const handleLocaleChange = async (locale: AppLocale) => {
    if (!user || user.preferred_locale === locale || updateLocaleMutation.isPending) {
      return;
    }

    setLocaleError(false);
    setLocaleSuccess(false);

    try {
      await updateLocaleMutation.mutateAsync(locale);
      setLocaleCookie(locale);
      setLocaleSuccess(true);
      router.refresh();
    } catch {
      setLocaleError(true);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">{t("eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
      </div>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("yourDetails")}</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">{tCommon("name")}</dt>
            <dd className="mt-1 text-foreground">{user.name}</dd>
          </div>
          <div>
            <dt className="text-muted">{tCommon("email")}</dt>
            <dd className="mt-1 text-foreground">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("language")}</h2>
        <p className="mt-2 text-sm text-muted">{t("languageDescription")}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {locales.map((locale) => {
            const selected = user.preferred_locale === locale;
            const label = locale === "sq" ? t("albanian") : t("english");

            return (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                disabled={updateLocaleMutation.isPending}
                aria-pressed={selected}
                className={`rounded-xl border px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  selected
                    ? "border-white/40 bg-white/10 text-foreground"
                    : "border-white/10 text-muted hover:border-white/25 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {updateLocaleMutation.isPending ? (
          <p className="mt-3 text-sm text-muted">{t("savingLanguage")}</p>
        ) : null}
        {localeSuccess ? (
          <p className="mt-3 text-sm text-emerald-300">{t("languageUpdated")}</p>
        ) : null}
        {localeError ? (
          <p className="mt-3 text-sm text-red-400">{t("unableToUpdateLanguage")}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("changePassword")}</h2>
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <div className="space-y-2">
            <label htmlFor="current_password" className="block text-sm text-foreground">
              {t("currentPassword")}
            </label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-white/30"
              {...register("current_password")}
            />
            {errors.current_password ? (
              <p className="text-sm text-red-400">{errors.current_password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm text-foreground">
              {tCommon("newPassword")}
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
              {t("confirmNewPassword")}
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

          {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
          {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || changePasswordMutation.isPending}
            className="rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting || changePasswordMutation.isPending
              ? tCommon("updating")
              : t("updatePassword")}
          </button>
        </form>
      </section>
    </main>
  );
}
