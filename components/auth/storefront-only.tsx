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
  const userIsAdmin = isAdmin(user);

  useEffect(() => {
    if (!isLoading && userIsAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isLoading, router, userIsAdmin]);

  if (isLoading) {
    return <LoadingLabel />;
  }

  if (userIsAdmin) {
    return null;
  }

  return children;
}
