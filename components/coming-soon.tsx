export function ComingSoon() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div aria-hidden className="spotlight-scene pointer-events-none absolute inset-0 overflow-hidden">
        <div className="spotlight-base" />
        <div className="spotlight-reveal-glow" />
        <div className="spotlight-beam" />
        <div className="spotlight-vignette" />
      </div>

      <main className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <span className="animate-fade-in-up reveal-badge mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted backdrop-blur-sm">
          Coming Soon
        </span>

        <h1 className="animate-fade-in-up reveal-title font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
          Hoodini Studio
        </h1>

        <p className="animate-fade-in-up reveal-message mt-6 max-w-md text-base leading-relaxed text-muted sm:mt-8 sm:text-lg">
          Something amazing is coming soon.
        </p>
      </main>
    </div>
  );
}
