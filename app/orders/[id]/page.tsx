"use client";

import { use } from "react";
import { AuthOnly } from "@/components/auth/auth-only";
import { StorefrontOnly } from "@/components/auth/storefront-only";
import { MyOrderDetailContent } from "@/components/my-order-detail";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthOnly>
      <StorefrontOnly>
        <main>
          <MyOrderDetailContent orderId={id} />
        </main>
      </StorefrontOnly>
    </AuthOnly>
  );
}
