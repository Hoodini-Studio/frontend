"use client";

import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
