import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function AccountSettingsSkeleton() {
  return (
    <main
      className="mx-auto max-w-2xl px-6 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>

      <div className="mb-8">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-3 h-9 w-56 sm:w-72" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-md" />
      </div>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <SkeletonBlock className="h-5 w-28" />
        <div className="mt-5 space-y-4">
          <div>
            <SkeletonBlock className="h-3 w-12" />
            <SkeletonBlock className="mt-2 h-4 w-32" />
          </div>
          <div>
            <SkeletonBlock className="h-3 w-12" />
            <SkeletonBlock className="mt-2 h-4 w-48" />
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="mt-3 h-4 w-56" />
        <div className="mt-5 flex gap-3">
          <SkeletonBlock className="h-10 w-20 rounded-xl" />
          <SkeletonBlock className="h-10 w-24 rounded-xl" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <SkeletonBlock className="h-5 w-36" />
        <div className="mt-5 space-y-5">
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-36 rounded-xl" />
        </div>
      </section>
    </main>
  );
}
