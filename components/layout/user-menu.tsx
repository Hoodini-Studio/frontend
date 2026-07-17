"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLogoutMutation } from "@/hooks/use-auth";
import { getUserAvatarUrl, getUserInitials } from "@/lib/auth/user-display";
import { isAdmin } from "@/lib/auth/roles";
import { resetLocaleCookie } from "@/lib/i18n/cookie";
import type { User } from "@/types/user";

type UserMenuProps = {
  user: User;
};

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoutMutation = useLogoutMutation();
  const initials = getUserInitials(user.name);
  const avatarUrl = getUserAvatarUrl(user);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logoutMutation.mutateAsync();
    resetLocaleCookie();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center rounded-full outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-xs font-semibold tracking-wide text-foreground">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] py-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          {isAdmin(user) ? (
            <Link
              href="/admin/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5"
            >
              {t("dashboard")}
            </Link>
          ) : null}

          <Link
            href="/account-settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-foreground transition hover:bg-white/5"
          >
            {t("accountSettings")}
          </Link>

          <div className="my-2 border-t border-white/10" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="block w-full px-4 py-2.5 text-left text-sm text-red-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutMutation.isPending ? t("signingOut") : t("logOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
