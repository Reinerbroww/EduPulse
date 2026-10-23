import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

const tones: Record<AlertTone, string> = {
  info: "border-info/30 bg-info-soft text-ink",
  success: "border-success/30 bg-success-soft text-ink",
  warning: "border-warning/30 bg-warning-soft text-ink",
  danger: "border-danger/30 bg-danger-soft text-ink",
};

export function Alert({
  tone = "info",
  className,
  role = "status",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  return (
    <div
      role={role}
      className={cn(
        "rounded-[var(--radius-control)] border px-4 py-3 text-sm",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
