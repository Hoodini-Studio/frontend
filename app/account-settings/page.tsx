import { AuthOnly } from "@/components/auth/auth-only";
import { ProfileForm } from "@/components/profile/profile-form";

export default function AccountSettingsPage() {
  return (
    <AuthOnly>
      <ProfileForm />
    </AuthOnly>
  );
}
