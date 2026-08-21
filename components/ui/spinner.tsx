export function Spinner({
  className,
  size = "md",
  label = "Loading",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeClass =
    size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center ${className ?? ""}`}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className={`${sizeClass} animate-spin rounded-full border border-white/15 border-t-foreground`}
      />
    </span>
  );
}
