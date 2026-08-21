"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-commerce";
import { useFavouriteIds } from "@/hooks/use-favourites";
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

function HeartIcon({ className }: { className?: string }) {
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
      <path d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.012a5 5 0 1 1 7.5 6.56Z" />
    </svg>
  );
}

export function SiteHeader() {
  const t = useTranslations("common");
  const { data: user, isLoading } = useCurrentUser();
  const showStoreIcons = !isAdmin(user);
  const cartQuery = useCart({ enabled: showStoreIcons && !isLoading });
  const favouritesQuery = useFavouriteIds({
    enabled: showStoreIcons && !isLoading,
  });
  const homePath = getHomePathForUser(user);
  const cartCount = cartQuery.data?.item_count ?? 0;
  const favouritesCount = favouritesQuery.data?.length ?? 0;
  const previousCountRef = useRef<number | null>(null);
  const [badgeBumping, setBadgeBumping] = useState(false);

  useEffect(() => {
    if (!cartQuery.isSuccess) {
      return;
    }

    const previous = previousCountRef.current;
    previousCountRef.current = cartCount;

    if (previous == null || cartCount <= previous) {
      return;
    }

    setBadgeBumping(false);
    const frame = window.requestAnimationFrame(() => setBadgeBumping(true));

    return () => window.cancelAnimationFrame(frame);
  }, [cartCount, cartQuery.isSuccess]);

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
          {showStoreIcons ? (
            <>
              <Link
                href="/favourites"
                aria-label={t("favourites")}
                className="relative text-muted transition hover:text-foreground"
              >
                <HeartIcon className="h-5 w-5" />
                {favouritesCount > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                    {favouritesCount > 99 ? "99+" : favouritesCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/cart"
                aria-label={t("cart")}
                className="relative text-muted transition hover:text-foreground"
              >
                <CartIcon className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span
                    className={`absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background ${
                      badgeBumping ? "cart-badge-bump" : ""
                    }`}
                    onAnimationEnd={() => setBadgeBumping(false)}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </Link>
            </>
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
