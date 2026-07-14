import type { Metadata } from "next";
import { AuthOnly } from "@/components/auth/auth-only";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Account settings",
};

export default function AccountSettingsPage() {
  return (
    <AuthOnly>
      <ProfileForm />
    </AuthOnly>
  );
}
