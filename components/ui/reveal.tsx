"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms once visible. */
  delayMs?: number;
  /** Root margin for IntersectionObserver (default pulls reveal slightly early). */
  rootMargin?: string;
};

/**
 * Subtle opacity + upward reveal on scroll. Content stays in flow.
 * `prefers-reduced-motion` is handled in CSS so content remains visible without JS.
 */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
  rootMargin = "0px 0px -40px 0px",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={`reveal-base ${visible ? "reveal-visible" : ""} ${className}`.trim()}
      style={visible && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
