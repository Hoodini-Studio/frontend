export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-white/[0.06] ${className ?? ""}`}
    />
  );
}
