import { cn } from "@/lib/utils/cn";

const SIZES = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-lg",
} as const;

const TONES = [
  "bg-primary/10 text-primary",
  "bg-info-soft text-info",
  "bg-success-soft text-success",
  "bg-warning-soft text-warning",
  "bg-accent/20 text-accent-foreground",
] as const;

// Deterministic tone so the same name keeps the same color across pages.
function toneIndex(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % TONES.length;
}

export function initialsFor(name: string | null | undefined): string {
  const value = (name ?? "").trim();
  if (!value) return "?";
  const parts = value.split(/\s+/).slice(0, 2);
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string | null | undefined;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const label = (name ?? "").trim() || "Pengguna";
  const initials = initialsFor(label);

  return (
    <span
      aria-hidden
      title={label}
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
        SIZES[size],
        TONES[toneIndex(label)],
        className,
      )}
    >
      {initials}
    </span>
  );
}
