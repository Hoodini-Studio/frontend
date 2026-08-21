import type { Metadata } from "next";
import { EmailPreferencesSettings } from "@/components/profile/email-preferences-settings";

export const metadata: Metadata = {
  title: "Email preferences",
};

export default function AccountEmailsPage() {
  return <EmailPreferencesSettings />;
}
