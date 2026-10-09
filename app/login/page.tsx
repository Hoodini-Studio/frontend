import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { LoginForm } from "@/components/auth/login-form";
import { LoadingLabel } from "@/components/i18n/loading-label";
import { NO_INDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  robots: NO_INDEX_ROBOTS,
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
