"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";
import { UserMenu } from "@/components/layout/user-menu";
import { getHomePathForUser } from "@/lib/auth/roles";

export function SiteHeader() {
  const { data: user, isLoading } = useCurrentUser();
  const homePath = getHomePathForUser(user);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={homePath}
          className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-foreground transition hover:opacity-80"
        >
          Hoodini Studio
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isLoading ? (
            <span className="text-muted">Loading...</span>
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted transition hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-white/10 px-4 py-2 text-foreground transition hover:border-white/25 hover:bg-white/5"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
