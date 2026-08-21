import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <div className="border-b border-white/10 bg-white/3 px-4 py-3">
        <div className="flex gap-6">
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonBlock key={index} className="h-3 w-16" />
          ))}
        </div>
      </div>
      <ul className="divide-y divide-white/10">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <li key={rowIndex} className="flex gap-6 px-4 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBlock
                key={colIndex}
                className={`h-4 ${colIndex === 0 ? "w-28" : "w-16"}`}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
