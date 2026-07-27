"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountSettingsSkeleton } from "@/components/profile/account-settings-skeleton";
import { useCurrentUser } from "@/hooks/use-auth";

type AuthOnlyProps = {
  children: React.ReactNode;
};

export function AuthOnly({ children }: AuthOnlyProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const userId = user?.id;

  useEffect(() => {
    if (!isLoading && !userId) {
      router.replace("/login");
    }
  }, [isLoading, router, userId]);

  if (isLoading || !user) {
    return <AccountSettingsSkeleton />;
  }

  return children;
}
