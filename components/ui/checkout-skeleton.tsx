import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function CheckoutSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="mt-2 h-11 w-full rounded-xl" />
          </div>
        ))}
        <SkeletonBlock className="mt-4 h-11 w-40 rounded-xl" />
      </div>
      <div className="space-y-4 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex justify-between gap-4">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-14" />
          </div>
        ))}
        <SkeletonBlock className="h-5 w-full" />
      </div>
    </div>
  );
}
