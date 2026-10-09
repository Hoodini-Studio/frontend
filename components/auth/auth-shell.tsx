"use client";

import Link from "next/link";
import { LogoLockup } from "@/components/brand/logo-lockup";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(32,56,44,0.35),transparent_60%)]"
      />
      <div className="w-full max-w-md border border-border bg-surface px-8 py-10 animate-[fade-in-up_0.7s_ease-out]">
        <div className="mb-8 space-y-3 text-center">
          <Link href="/" className="inline-flex justify-center transition hover:opacity-85">
            <LogoLockup />
          </Link>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted">{description}</p>
        </div>

        {children}

        <div className="mt-6 text-center text-sm text-muted">{footer}</div>
      </div>
    </main>
  );
}
