"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type SectionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** In-page section jump with sticky-header offset via `.anchor-scroll` on targets. */
export function SectionLink({ href, className, children }: SectionLinkProps) {
  const pathname = usePathname();
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex + 1) : null;
  const isHomeHash = Boolean(hash) && (href.startsWith("/#") || href.startsWith("#"));

  if (pathname === "/" && isHomeHash && hash) {
    return (
      <a
        href={`#${hash}`}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(null, "", `#${hash}`);
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
