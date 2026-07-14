import { GuestOnly } from "@/components/auth/guest-only";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <GuestOnly>
      <ForgotPasswordForm />
    </GuestOnly>
  );
}
