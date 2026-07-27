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
  const postAuthPath = user ? getPostAuthPath(user) : null;

  useEffect(() => {
    if (!isLoading && postAuthPath) {
      router.replace(postAuthPath);
    }
  }, [isLoading, postAuthPath, router]);

  if (isLoading || user) {
    return <LoadingLabel />;
  }

  return children;
}
