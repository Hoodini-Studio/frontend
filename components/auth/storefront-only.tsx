"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingLabel } from "@/components/i18n/loading-label";
import { useCurrentUser } from "@/hooks/use-auth";
import { isAdmin } from "@/lib/auth/roles";

type StorefrontOnlyProps = {
  children: React.ReactNode;
};

export function StorefrontOnly({ children }: StorefrontOnlyProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user && isAdmin(user)) {
      router.replace("/admin/dashboard");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return <LoadingLabel />;
  }

  if (user && isAdmin(user)) {
    return null;
  }

  return children;
}
