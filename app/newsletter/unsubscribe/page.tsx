import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterUnsubscribeStatus } from "@/components/newsletter/unsubscribe-status";
import { NO_INDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Newsletter unsubscribe",
  robots: NO_INDEX_ROBOTS,
};

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <NewsletterUnsubscribeStatus />
    </Suspense>
  );
}
