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

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return <AccountSettingsSkeleton />;
  }

  return children;
}
