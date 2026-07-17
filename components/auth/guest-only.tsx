"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingLabel } from "@/components/i18n/loading-label";
import { useCurrentUser } from "@/hooks/use-auth";
import { getPostAuthPath } from "@/lib/auth/roles";

type GuestOnlyProps = {
  children: React.ReactNode;
};

export function GuestOnly({ children }: GuestOnlyProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getPostAuthPath(user));
    }
  }, [isLoading, router, user]);

  if (isLoading || user) {
    return <LoadingLabel />;
  }

  return children;
}
