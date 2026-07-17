"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAdmin } from "@/lib/auth/roles";

type AdminOnlyProps = {
  children: React.ReactNode;
};

export function AdminOnly({ children }: AdminOnlyProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAdmin(user)) {
      router.replace("/");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || !isAdmin(user)) {
    return <AdminDashboardSkeleton />;
  }

  return children;
}
