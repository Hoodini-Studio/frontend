import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">Admin</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Manage orders, customers, and store operations from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Orders",
          "Customers",
          "Products",
        ].map((section) => (
          <div
            key={section}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground">{section}</h2>
            <p className="mt-2 text-sm text-muted">Coming soon in the admin dashboard.</p>
          </div>
        ))}
      </div>
    </main>
  );
}
