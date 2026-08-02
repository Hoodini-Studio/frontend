"use client";

import { StorefrontCatalog } from "@/components/storefront-catalog";
import { StorefrontOnly } from "@/components/auth/storefront-only";

export function StorefrontHome() {
  return (
    <StorefrontOnly>
      <StorefrontCatalog />
    </StorefrontOnly>
  );
}
