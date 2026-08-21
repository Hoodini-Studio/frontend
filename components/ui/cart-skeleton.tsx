import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function CartSkeleton() {
  return (
    <div className="mt-10 space-y-0" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {Array.from({ length: 2 }).map((_, index) => (
          <li key={index} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <SkeletonBlock className="h-24 w-20 shrink-0 rounded-none" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
            <SkeletonBlock className="h-9 w-28 rounded-xl" />
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-between">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-4 w-16" />
      </div>
      <SkeletonBlock className="mt-6 h-11 w-36 rounded-xl" />
    </div>
  );
}
