import { OrderDetail } from "@/components/admin/order-detail";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <OrderDetail params={params} />
    </main>
  );
}
