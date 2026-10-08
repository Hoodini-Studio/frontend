import type { Metadata } from "next";
import { OrderDetail } from "@/components/admin/order-detail";
import { pageShellClass } from "@/lib/layout";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className={pageShellClass("reading", "py-10")}>
      <OrderDetail params={params} />
    </main>
  );
}
