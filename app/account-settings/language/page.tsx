import type { Metadata } from "next";
import { LanguageSettings } from "@/components/profile/language-settings";

export const metadata: Metadata = {
  title: "Language",
};

export default function AccountLanguagePage() {
  return <LanguageSettings />;
}
