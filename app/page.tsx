import type { Metadata } from "next";
import { StorefrontHome } from "@/components/storefront-home";

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
    // TODO: switch to summary_large_image when opengraph-image.png is added
    card: "summary",
    title: "Hoodini Studio",
    description,
  },
};

export default function Home() {
  return <StorefrontHome />;
}
