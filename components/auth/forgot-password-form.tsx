"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { useForgotPasswordMutation } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPasswordMutation.mutateAsync(values);
      setSuccessMessage(response.message);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setFormError("Too many attempts. Please wait a minute and try again.");
          return;
        }

        Object.entries(error.errors).forEach(([field, messages]) => {
          if (field === "email") {
            setError(field, { message: messages[0] });
          }
        });

        setFormError(error.message);
        return;
      }

      setFormError("Unable to send reset email. Please try again.");
    }
  });

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we'll send a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-foreground">
            Email
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

        {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || forgotPasswordMutation.isPending}
          className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
