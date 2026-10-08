"use client";

import { NewsletterSignup } from "@/components/newsletter/newsletter-signup";
import { StorefrontCatalog } from "@/components/storefront-catalog";
import { StorefrontOnly } from "@/components/auth/storefront-only";

export function StorefrontHome() {
  return (
    <StorefrontOnly>
      <StorefrontCatalog />
      {/* Standalone block — move between catalog sections when homepage sections land */}
      <NewsletterSignup className="mt-16" />
    </StorefrontOnly>
  );
}
