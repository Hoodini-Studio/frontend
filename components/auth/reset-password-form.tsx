"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { useResetPasswordMutation } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      token: searchParams.get("token") ?? "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await resetPasswordMutation.mutateAsync(values);
      router.push("/login?reset=1");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (
            field === "email" ||
            field === "token" ||
            field === "password" ||
            field === "password_confirmation"
          ) {
            setError(field, { message: messages[0] });
          }
        });

        setFormError(error.message);
        return;
      }

      setFormError("Unable to reset password. Please try again.");
    }
  });

  return (
    <AuthShell
      title="Reset password"
      description="Choose a new password for your account."
      footer={
        <>
          Back to{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <input type="hidden" {...register("token")} />

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            readOnly
            className="w-full cursor-default rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted outline-none"
            {...register("email")}
          />
          {errors.email ? <p className="text-sm text-red-400">{errors.email.message}</p> : null}
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
            Confirm password
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

        {errors.token ? <p className="text-sm text-red-400">{errors.token.message}</p> : null}
        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || resetPasswordMutation.isPending}
          className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || resetPasswordMutation.isPending ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
