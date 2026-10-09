"use client";

import Image from "next/image";
import { ArrowMark } from "@/components/brand/arrow-mark";
import { useHomeLayer } from "@/hooks/use-home-layer";
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

export function HomeHero() {
  const copy = useHomepageCopy();
  const [layerRef, layer] = useHomeLayer({ z: 1, pin: "always" });

  return (
    <section
      id="home-hero"
      ref={layerRef}
      data-stack={layer["data-stack"]}
      style={layer.style}
      className={`${layer.className} grain-overlay isolate overflow-hidden border-b border-border`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_75%_40%,rgba(32,56,44,0.45),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_15%_80%,rgba(20,20,22,0.9),transparent_55%)]" />
      </div>

      <div
        className={pageShellClass(
          "shell",
          "grid min-h-dvh items-start gap-8 pb-14 pt-12 sm:gap-10 sm:pb-20 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14",
        )}
      >
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted animate-[fade-in-up_0.9s_ease-out]">
            {copy.heroEyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.75rem,9vw,5.75rem)] font-extrabold leading-[0.92] tracking-[-0.03em] text-foreground animate-[fade-in-up_0.9s_ease-out] [animation-delay:80ms] [animation-fill-mode:both]">
            <HeadlineLines text={copy.heroHeadline} />
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg animate-[fade-in-up_0.9s_ease-out] [animation-delay:140ms] [animation-fill-mode:both]">
            {copy.heroSupport}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6 animate-[fade-in-up_0.9s_ease-out] [animation-delay:200ms] [animation-fill-mode:both]">
            <a
              href={copy.heroCtaHref}
              className="group inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-sm font-medium text-background transition hover:opacity-90"
            >
              {copy.heroCtaLabel}
              <ArrowMark className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href={copy.heroSecondaryHref}
              className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition hover:text-foreground"
            >
              {copy.heroSecondaryLabel}
              <ArrowMark className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden border border-border/80 bg-surface/40 animate-[fade-in-up_0.9s_ease-out] [animation-delay:120ms] [animation-fill-mode:both] lg:mx-0 lg:max-w-none lg:justify-self-end">
          <Image
            src={copy.heroImageUrl}
            alt=""
            fill
            unoptimized
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 90vw, 40vw"
          />
        </div>
      </div>
    </section>
  );
}
