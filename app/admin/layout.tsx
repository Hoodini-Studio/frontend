import type { Metadata } from "next";
import { AdminOnly } from "@/components/auth/admin-only";
import { NO_INDEX_ROBOTS } from "@/lib/site";

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminOnly>{children}</AdminOnly>;
}
