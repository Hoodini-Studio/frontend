import { SkeletonBlock } from "@/components/ui/skeleton-block";

export function ChipGroupSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className={`h-9 ${index % 2 === 0 ? "w-24" : "w-16"}`}
        />
      ))}
    </div>
  );
}
