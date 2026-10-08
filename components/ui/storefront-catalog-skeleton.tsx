import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { pageShellClass } from "@/lib/layout";

/** Full homepage chrome + product grid — matches StorefrontCatalog loaded layout. */
export function StorefrontCatalogSkeleton() {
  return (
    <div
      className={pageShellClass("shell", "min-h-[calc(100vh-4rem)] py-12 sm:py-16")}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>

      <header className="mb-12 max-w-2xl">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="mt-3 h-10 w-56 sm:h-12 sm:w-72" />
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
        <SkeletonBlock className="h-10 w-full max-w-xs sm:w-56" />
        <SkeletonBlock className="h-10 w-28" />
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="ml-auto h-10 w-36" />
      </div>

      <ProductGridSkeleton />
    </div>
  );
}
