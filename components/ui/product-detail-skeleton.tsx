import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function ProductDetailSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-2"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <div className="space-y-4">
        <SkeletonBlock className="aspect-4/5 w-full rounded-none" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="aspect-square w-full rounded-none" />
          ))}
        </div>
      </div>
      <div>
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-4 h-10 w-3/4" />
        <SkeletonBlock className="mt-5 h-6 w-20" />
        <div className="mt-8 space-y-5">
          <div>
            <SkeletonBlock className="h-3 w-16" />
            <div className="mt-2 flex gap-2">
              <SkeletonBlock className="h-9 w-24" />
              <SkeletonBlock className="h-9 w-24" />
            </div>
          </div>
          <div>
            <SkeletonBlock className="h-3 w-12" />
            <div className="mt-2 flex gap-2">
              <SkeletonBlock className="h-9 w-10" />
              <SkeletonBlock className="h-9 w-10" />
              <SkeletonBlock className="h-9 w-10" />
            </div>
          </div>
        </div>
        <SkeletonBlock className="mt-8 h-11 w-40 rounded-xl" />
        <SkeletonBlock className="mt-8 h-4 w-full" />
        <SkeletonBlock className="mt-2 h-4 w-5/6" />
      </div>
    </div>
  );
}
