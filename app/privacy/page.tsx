import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

const title = "Privacy Policy";
const description = "Privacy Policy for Hoodini Studio.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title,
    description,
    url: "/privacy",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function PrivacyPage() {
  return <LegalDocument doc="privacy" />;
}
