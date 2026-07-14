"use client";

import { ComingSoon } from "@/components/coming-soon";
import { StorefrontOnly } from "@/components/auth/storefront-only";

export function StorefrontHome() {
  return (
    <StorefrontOnly>
      <ComingSoon />
    </StorefrontOnly>
  );
}
