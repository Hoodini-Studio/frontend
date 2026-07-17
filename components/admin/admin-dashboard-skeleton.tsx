import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function AdminDashboardSkeleton() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>

      <div className="mb-8">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="mt-3 h-10 w-48 sm:w-64" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-xl" />
        <SkeletonBlock className="mt-2 h-4 w-2/3 max-w-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="mt-4 h-3 w-full" />
            <SkeletonBlock className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </main>
  );
}
