"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-commerce";
import { UserMenu } from "@/components/layout/user-menu";
import { getHomePathForUser, isAdmin } from "@/lib/auth/roles";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function SiteHeader() {
  const t = useTranslations("common");
  const { data: user, isLoading } = useCurrentUser();
  const showCart = !isAdmin(user);
  const cartQuery = useCart({ enabled: showCart && !isLoading });
  const homePath = getHomePathForUser(user);
  const cartCount = cartQuery.data?.item_count ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/95 print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={homePath}
          className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-foreground transition hover:opacity-80"
        >
          {t("brand")}
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {showCart ? (
            <Link
              href="/cart"
              aria-label={t("cart")}
              className="relative text-muted transition hover:text-foreground"
            >
              <CartIcon className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          {isLoading ? (
            <div
              aria-hidden
              className="h-9 w-9 animate-pulse rounded-full border border-white/10 bg-white/10"
            />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted transition hover:text-foreground"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-white/10 px-4 py-2 text-foreground transition hover:border-white/25 hover:bg-white/5"
              >
                {t("register")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
