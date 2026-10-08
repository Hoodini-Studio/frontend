import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

const title = "Terms of Service";
const description = "Terms of Service for Hoodini Studio.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: {
    title,
    description,
    url: "/terms",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function TermsPage() {
  return <LegalDocument doc="terms" />;
}
