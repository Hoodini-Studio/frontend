import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { LoginForm } from "@/components/auth/login-form";
import { LoadingLabel } from "@/components/i18n/loading-label";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <GuestOnly>
      <Suspense fallback={<LoadingLabel />}>
        <LoginForm />
      </Suspense>
    </GuestOnly>
  );
}
