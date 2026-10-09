import type { Metadata } from "next";
import { AuthOnly } from "@/components/auth/auth-only";
import { NO_INDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
};

export default function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthOnly>{children}</AuthOnly>;
}
