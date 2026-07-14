"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useChangePasswordMutation, useCurrentUser } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/auth";

export function ProfileForm() {
  const { data: user } = useCurrentUser();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const changePasswordMutation = useChangePasswordMutation();

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
      setSuccessMessage(response.message);
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (
            field === "current_password" ||
            field === "password" ||
            field === "password_confirmation"
          ) {
            setError(field, { message: messages[0] });
          }
        });

        setFormError(error.message);
        return;
      }

      setFormError("Unable to change password. Please try again.");
    }
  });

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">Account</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">
          Account settings
        </h1>
        <p className="mt-3 text-muted">Manage your account details and password.</p>
      </div>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Your details</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="mt-1 text-foreground">{user.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-1 text-foreground">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Change password</h2>
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <div className="space-y-2">
            <label htmlFor="current_password" className="block text-sm text-foreground">
              Current password
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
              New password
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
              Confirm new password
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
              ? "Updating..."
              : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
}
