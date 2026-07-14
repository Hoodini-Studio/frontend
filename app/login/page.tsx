import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <GuestOnly>
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </GuestOnly>
  );
}
