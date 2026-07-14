"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { useLoginMutation } from "@/hooks/use-auth";
import { getPostAuthPath } from "@/lib/auth/roles";
import { ApiError } from "@/lib/api/client";
import { loginSchema, type LoginInput } from "@/schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const response = await loginMutation.mutateAsync(values);
      router.push(getPostAuthPath(response.data));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setFormError("Too many login attempts. Please wait a minute and try again.");
          return;
        }

        const emailError = error.errors.email?.[0] ?? "";
        if (emailError.toLowerCase().includes("verify your email")) {
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }

        Object.entries(error.errors).forEach(([field, messages]) => {
          if (field === "email" || field === "password") {
            setError(field, { message: messages[0] });
          }
        });

        setFormError(error.message);
        return;
      }

      setFormError("Unable to sign in. Please try again.");
    }
  });

  return (
    <AuthShell
      title="Sign in"
      description="Use your Hoodini Studio account to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {verified ? (
        <p className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          Email verified. You can sign in now.
        </p>
      ) : null}

      {reset ? (
        <p className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          Password updated. You can sign in with your new password.
        </p>
      ) : null}

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
          {errors.email ? (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-sm text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted transition hover:text-foreground"
            >
              Forgot password?
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
          {isSubmitting || loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
