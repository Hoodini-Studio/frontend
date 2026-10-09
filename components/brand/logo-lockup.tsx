import { StarMark } from "@/components/brand/star-mark";

type LogoLockupProps = {
  className?: string;
  markClassName?: string;
  showStudio?: boolean;
};

export function LogoLockup({
  className,
  markClassName = "h-5 w-5",
  showStudio = true,
}: LogoLockupProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`.trim()}>
      <StarMark className={`shrink-0 text-foreground ${markClassName}`} />
      <span className="font-display text-[13px] font-extrabold uppercase tracking-[0.14em] text-foreground sm:text-sm">
        Hoodini
        {showStudio ? (
          <span className="ml-1.5 font-light tracking-[0.16em]">Studio</span>
        ) : null}
      </span>
    </span>
  );
}
