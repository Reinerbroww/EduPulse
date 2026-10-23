import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function Logo({
  href = "/",
  className,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-ink no-underline",
        className,
      )}
      aria-label="EduPulse — beranda"
    >
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-primary-foreground"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13h3l2 5 3.5-11L14 15l2-2h5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark ? <span className="text-lg">EduPulse</span> : null}
    </Link>
  );
}
