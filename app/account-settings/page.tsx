import type { Metadata } from "next";
import { SettingsHub } from "@/components/profile/settings-hub";

export const metadata: Metadata = {
  title: "Account settings",
};

export default function AccountSettingsPage() {
  return <SettingsHub />;
}
