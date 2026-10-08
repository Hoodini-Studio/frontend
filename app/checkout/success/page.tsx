import type { Metadata } from "next";
import { CheckoutSuccessContent } from "@/components/checkout-success-content";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutSuccessPage() {
  return (
    <main>
      <CheckoutSuccessContent />
    </main>
  );
}
