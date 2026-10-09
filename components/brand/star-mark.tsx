type StarMarkProps = {
  className?: string;
  title?: string;
};

/** Official Hoodini 4-point star mark (white fill via currentColor). */
export function StarMark({ className, title }: StarMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        fill="currentColor"
        d="M100 2 L104.21 89.837 L139.598 60.402 L110.163 95.79 L198 100 L110.163 104.21 L139.598 139.598 L104.21 110.163 L100 198 L95.79 110.163 L60.402 139.598 L89.837 104.21 L2 100 L89.837 95.79 L60.402 60.402 L95.79 89.837 Z"
      />
    </svg>
  );
}
