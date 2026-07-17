"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="mb-8 space-y-2 text-center">
          <Link
            href="/"
            className="font-display text-sm uppercase tracking-[0.35em] text-muted transition hover:text-foreground"
          >
            {t("brand")}
          </Link>
          <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted">{description}</p>
        </div>

        {children}

        <div className="mt-6 text-center text-sm text-muted">{footer}</div>
      </div>
    </main>
  );
}
