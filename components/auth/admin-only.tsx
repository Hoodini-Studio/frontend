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
  const userId = user?.id;
  const userIsAdmin = isAdmin(user);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!userId) {
      router.replace("/login");
      return;
    }

    if (!userIsAdmin) {
      router.replace("/");
    }
  }, [isLoading, router, userId, userIsAdmin]);

  if (isLoading || !user || !userIsAdmin) {
    return <AdminDashboardSkeleton />;
  }

  return children;
}
