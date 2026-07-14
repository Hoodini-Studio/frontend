"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (user && isAdmin(user)) {
    return null;
  }

  return children;
}
