import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingLabel } from "@/components/i18n/loading-label";
import { NO_INDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reset password",
  robots: NO_INDEX_ROBOTS,
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
