import type { Metadata } from "next";
import { GuestOnly } from "@/components/auth/guest-only";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { NO_INDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: NO_INDEX_ROBOTS,
};

export default function ForgotPasswordPage() {
  return (
    <GuestOnly>
      <ForgotPasswordForm />
    </GuestOnly>
  );
}
