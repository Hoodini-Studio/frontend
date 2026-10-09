import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowMark } from "@/components/brand/arrow-mark";
import { pageShellClass } from "@/lib/layout";

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
    <main className={pageShellClass("form", "py-12 sm:py-16")}>
      <Link
        href="/account-settings"
        className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted transition hover:text-foreground"
      >
        <ArrowMark className="h-3.5 w-3.5 rotate-180 transition group-hover:-translate-x-0.5" />
        {backLabel}
      </Link>

      <div className="mt-8 mb-10 border-b border-border pb-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </div>

      {children}
    </main>
  );
}
