import { GuestOnly } from "@/components/auth/guest-only";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  );
}
