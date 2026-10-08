import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { pageShellClass } from "@/lib/layout";

/**
 * Generic admin gate / page loading shell.
 * Uses the same max-width as admin list pages and the site header (max-w-6xl).
 */
export function AdminPageSkeleton() {
  return (
    <main
      className="relative isolate min-h-[calc(100vh-4rem)]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <div className={pageShellClass("shell", "py-10 sm:py-12")}>
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-3 h-10 w-56 sm:w-72" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />

        <div className="mt-10 space-y-3 border-y border-white/10 py-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 border-b border-white/5 py-4 last:border-b-0"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="h-3 w-full max-w-md" />
              </div>
              <SkeletonBlock className="h-8 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
