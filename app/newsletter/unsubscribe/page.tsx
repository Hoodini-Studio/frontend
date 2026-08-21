import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterUnsubscribeStatus } from "@/components/newsletter/unsubscribe-status";

export const metadata: Metadata = {
  title: "Newsletter unsubscribe",
};

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <NewsletterUnsubscribeStatus />
    </Suspense>
  );
}
