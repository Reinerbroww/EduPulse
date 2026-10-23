import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border-strong bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="mb-1 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
