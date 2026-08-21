import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <SkeletonBlock className="h-4 w-28" />
      <div>
        <SkeletonBlock className="h-9 w-48" />
        <SkeletonBlock className="mt-3 h-4 w-40" />
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-4 w-52" />
      </div>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {Array.from({ length: 2 }).map((_, index) => (
          <li key={index} className="flex justify-between gap-4 py-4">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-4 w-16" />
          </li>
        ))}
      </ul>
    </div>
  );
}
