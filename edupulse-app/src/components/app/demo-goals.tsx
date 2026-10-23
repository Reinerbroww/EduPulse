import Link from "next/link";

import { DemoBadge } from "@/components/app/demo-groups";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import {
  DEMO_GOALS,
  DEMO_GOAL_DISCLAIMER,
  DEMO_LABEL,
} from "@/lib/demo/fixtures";

// Rendered on `/goals` only when the signed-in user has no real goals yet. It
// shows how a goal + milestone + progress row will look once they create one.
export function DemoGoalsSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Tujuan contoh</h2>
        <DemoBadge />
      </div>

      <Alert tone="warning" role="alert">
        <strong className="font-semibold">
          {DEMO_LABEL} — bukan data nyata.
        </strong>{" "}
        {DEMO_GOAL_DISCLAIMER}
      </Alert>

      <div className="flex flex-col gap-4">
        {DEMO_GOALS.map((goal) => (
          <div
            key={goal.slug}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold">{goal.title}</h3>
                <p className="text-xs text-muted">
                  {goal.topic} · {goal.supportMode} · Target {goal.targetDate}{" "}
                  (contoh)
                </p>
              </div>
              <DemoBadge />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span>Progres (contoh)</span>
                <span className="font-medium text-ink">
                  {goal.progressPercent}%
                </span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-valuenow={goal.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-primary"
                  style={{ width: `${goal.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {goal.milestones.map((milestone) => (
                <Badge key={milestone} tone="neutral">
                  {milestone}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-muted">
              Langkah berikutnya: {goal.nextStep}
            </p>
          </div>
        ))}
      </div>

      <div>
        <Link
          href="/goals/new"
          className={buttonClasses("primary", "md", "no-underline")}
        >
          Buat tujuan pertamaku
        </Link>
      </div>
    </section>
  );
}

// Compact version used on the dashboard so an empty account still shows how a
// goal card looks inside the overview grid.
export function DemoGoalsPreview() {
  const goal = DEMO_GOALS[0];
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{goal.title}</p>
          <p className="text-xs text-muted">
            {goal.topic} · Target {goal.targetDate} (contoh)
          </p>
        </div>
        <DemoBadge />
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={goal.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-primary"
          style={{ width: `${goal.progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-muted">
        {goal.progressPercent}% · {goal.nextStep}
      </p>
    </div>
  );
}
