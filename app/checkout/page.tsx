import type { Metadata } from "next";
import { CheckoutPageContent } from "@/components/checkout-page";
import { pageShellClass } from "@/lib/layout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className={pageShellClass("shell", "py-12")}>
      <CheckoutPageContent />
    </main>
  );
}
