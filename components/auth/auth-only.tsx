"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  return children;
}
