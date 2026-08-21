import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <li key={index}>
            <SkeletonBlock className="aspect-4/5 w-full rounded-none" />
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-12" />
            </div>
            <SkeletonBlock className="mt-2 h-3 w-24" />
          </li>
        ))}
      </ul>
    </div>
  );
}
