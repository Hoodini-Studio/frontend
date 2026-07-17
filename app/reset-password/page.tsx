import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingLabel } from "@/components/i18n/loading-label";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <GuestOnly>
      <Suspense fallback={<LoadingLabel />}>
        <ResetPasswordForm />
      </Suspense>
    </GuestOnly>
  );
}
