"use client";

import { AuthOnly } from "@/components/auth/auth-only";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { MyOrdersPageContent } from "@/components/my-orders-page";

export default function OrdersPage() {
  return (
    <AuthOnly>
      <StorefrontOnly>
        <main>
          <MyOrdersPageContent />
        </main>
      </StorefrontOnly>
    </AuthOnly>
  );
}
