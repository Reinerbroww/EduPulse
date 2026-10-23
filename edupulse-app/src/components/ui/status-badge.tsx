import { Badge, type BadgeTone } from "@/components/ui/badge";
import { labelFor } from "@/lib/status";
import { cn } from "@/lib/utils/cn";

// Status is always rendered as a toned badge that includes a text label, never
// color alone (STEP 5, principle C).
export function StatusBadge({
  value,
  labels,
  tones,
  className,
}: {
  value: string | null | undefined;
  labels: Record<string, string>;
  tones?: Record<string, BadgeTone>;
  className?: string;
}) {
  const tone: BadgeTone = (value && tones?.[value]) || "neutral";

  return (
    <Badge tone={tone} className={cn(className)}>
      {labelFor(labels, value)}
    </Badge>
  );
}
