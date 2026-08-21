export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-lg bg-white/6 ${className ?? ""}`}
    />
  );
}
