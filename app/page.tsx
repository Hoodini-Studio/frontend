import type { Metadata } from "next";
import { StorefrontHome } from "@/components/storefront-home";
import { jsonLdScript, organizationJsonLd } from "@/lib/structured-data";

const description = "Shop the latest from Hoodini Studio.";

export const metadata: Metadata = {
  title: {
    absolute: "Hoodini Studio",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hoodini Studio",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoodini Studio",
    description,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(organizationJsonLd()),
        }}
      />
      <StorefrontHome />
    </>
  );
}
