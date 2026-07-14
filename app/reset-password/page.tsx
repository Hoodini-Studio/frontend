import { Suspense } from "react";
import { GuestOnly } from "@/components/auth/guest-only";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <GuestOnly>
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted">
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </GuestOnly>
  );
}
