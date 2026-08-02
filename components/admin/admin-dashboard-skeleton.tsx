import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function AdminDashboardSkeleton() {
  return (
    <main
      className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>

      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <div className="max-w-2xl">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="mt-4 h-12 w-56 sm:w-72" />
          <SkeletonBlock className="mt-5 h-4 w-full max-w-xl" />
          <SkeletonBlock className="mt-2 h-4 w-2/3 max-w-md" />
        </div>

        <div className="mt-14">
          <div className="border-y border-white/10 py-8 sm:py-10">
            <SkeletonBlock className="h-9 w-40 sm:w-52" />
            <SkeletonBlock className="mt-4 h-4 w-full max-w-lg" />
            <div className="mt-6 flex gap-6">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-4 w-20" />
            </div>
          </div>
          <SkeletonBlock className="mt-4 h-4 w-28" />
        </div>

        <div className="mt-16">
          <SkeletonBlock className="h-3 w-24" />
          <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-start justify-between gap-6 py-5">
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-5 w-28" />
                  <SkeletonBlock className="h-3 w-full max-w-sm" />
                </div>
                <SkeletonBlock className="h-3 w-10 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
