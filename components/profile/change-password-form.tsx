"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useChangePasswordMutation } from "@/hooks/use-auth";
import { useApiMessageTranslator } from "@/hooks/use-api-message-translator";
import { ApiError } from "@/lib/api/client";
import {
  createChangePasswordSchema,
  type ChangePasswordInput,
} from "@/schemas/auth";
import { SettingsShell } from "@/components/profile/settings-shell";

export function ChangePasswordForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const { translateMessage, translateErrors } = useApiMessageTranslator();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const changePasswordMutation = useChangePasswordMutation();

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

  return (
    <SettingsShell
      backLabel={t("backToSettings")}
      eyebrow={t("eyebrow")}
      title={t("passwordTitle")}
      subtitle={t("passwordSubtitle")}
    >
      <form onSubmit={onSubmit} className="space-y-5">
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
          <label
            htmlFor="password_confirmation"
            className="block text-sm text-foreground"
          >
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
            <p className="text-sm text-red-400">
              {errors.password_confirmation.message}
            </p>
          ) : null}
        </div>

        {successMessage ? (
          <p className="text-sm text-emerald-300">{successMessage}</p>
        ) : null}
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
    </SettingsShell>
  );
}
