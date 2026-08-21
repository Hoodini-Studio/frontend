import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function ListRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <ul className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            className="rounded-2xl border border-white/10 px-4 py-4"
          >
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="mt-3 h-3 w-full max-w-md" />
            <div className="mt-4 flex gap-3">
              <SkeletonBlock className="h-9 w-24 rounded-xl" />
              <SkeletonBlock className="h-9 w-24 rounded-xl" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
