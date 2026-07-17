import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { VerifyEmailNotice } from "@/components/auth/verify-email-notice";
import { LoadingLabel } from "@/components/i18n/loading-label";

export const metadata: Metadata = {
  title: "Verify your email",
};

export default function VerifyEmailPage() {
  return (
    <GuestOnly>
      <Suspense fallback={<LoadingLabel />}>
        <VerifyEmailNotice />
      </Suspense>
    </GuestOnly>
  );
}
