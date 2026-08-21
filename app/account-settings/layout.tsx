import { AuthOnly } from "@/components/auth/auth-only";

export default function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthOnly>{children}</AuthOnly>;
}
