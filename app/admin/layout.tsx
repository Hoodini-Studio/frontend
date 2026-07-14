import { AdminOnly } from "@/components/auth/admin-only";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminOnly>{children}</AdminOnly>;
}
