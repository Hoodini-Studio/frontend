import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { VerifyEmailNotice } from "@/components/auth/verify-email-notice";

export const metadata: Metadata = {
  title: "Verify your email",
};

export default function VerifyEmailPage() {
  return (
    <GuestOnly>
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted">
            Loading...
          </div>
        }
      >
        <VerifyEmailNotice />
      </Suspense>
    </GuestOnly>
  );
}
