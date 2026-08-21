import Link from "next/link";
import type { ReactNode } from "react";

type SettingsShellProps = {
  backLabel: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SettingsShell({
  backLabel,
  eyebrow,
  title,
  subtitle,
  children,
}: SettingsShellProps) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10 animate-[fade-in-up_0.45s_ease-out]">
      <Link
        href="/account-settings"
        className="inline-flex text-sm text-muted transition hover:text-foreground"
      >
        ← {backLabel}
      </Link>

      <div className="mt-8 mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 text-muted">{subtitle}</p> : null}
      </div>

      {children}
    </main>
  );
}
