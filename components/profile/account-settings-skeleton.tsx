import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function AccountSettingsSkeleton() {
  return (
    <main
      className="mx-auto max-w-2xl px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>

      <div className="mb-10">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-3 h-10 w-56 sm:w-72" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-md" />
      </div>

      <div className="border-y border-white/10">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border-b border-white/10 py-5 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="mt-2 h-4 w-40 max-w-full" />
            </div>
            <SkeletonBlock className="h-4 w-4 shrink-0" />
          </div>
        ))}
      </div>
    </main>
  );
}
