import type { Metadata } from "next";
import { StorefrontHome } from "@/components/storefront-home";

export const metadata: Metadata = {
  title: {
    absolute: "Hoodini Studio | Coming Soon",
  },
};

export default function Home() {
  return <StorefrontHome />;
}
