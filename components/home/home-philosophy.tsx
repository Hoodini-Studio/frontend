"use client";

import { ArrowMark } from "@/components/brand/arrow-mark";
import { Reveal } from "@/components/ui/reveal";
import { useHomepageCopy } from "@/hooks/use-homepage-copy";
import { pageShellClass } from "@/lib/layout";

function HeadlineLines({ text }: { text: string }) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  return (
    <>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

export function HomePhilosophy() {
  const copy = useHomepageCopy();

  return (
    <section
      aria-labelledby="home-philosophy-heading"
      className="grain-overlay relative border-y border-border bg-forest"
    >
      <Reveal>
        <div
          className={pageShellClass(
            "shell",
            "relative grid gap-10 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-end",
          )}
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-bone/55">
              {copy.philosophyEyebrow}
            </p>
            <h2
              id="home-philosophy-heading"
              className="mt-5 font-display text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-bone"
            >
              <HeadlineLines text={copy.philosophyHeadline} />
            </h2>
          </div>
          <div className="max-w-sm lg:justify-self-end">
            <div className="mb-6 h-px w-16 bg-brass/70" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-bone/70 sm:text-base">
              {copy.philosophyBody}
            </p>
            <a
              href={copy.philosophyCtaHref}
              className="group mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-bone transition hover:opacity-80"
            >
              {copy.philosophyCtaLabel}
              <ArrowMark className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
