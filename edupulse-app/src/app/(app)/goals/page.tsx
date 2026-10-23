import type { Metadata } from "next";
import Link from "next/link";

import { DemoGoalsSection } from "@/components/app/demo-goals";
import { PageHeader } from "@/components/app/page-header";
import { ProgressIcon } from "@/components/brand/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import { getLearningGoals } from "@/lib/data/goals";
import { isDemoModeEnabled } from "@/lib/demo/fixtures";
import {
  learningGoalStatusLabels,
  learningGoalStatusTones,
  supportModeLabels,
} from "@/lib/status";

export const metadata: Metadata = { title: "Tujuan belajar" };

export default async function GoalsPage() {
  await requireUser("/goals");
  const goals = await getLearningGoals();
  const demoEnabled = isDemoModeEnabled();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tujuan belajar"
        description="Tetapkan target konkret dan pilih dukungan yang kamu butuhkan."
        actions={
          <Link
            href="/goals/new"
            className={buttonClasses("primary", "md", "no-underline")}
          >
            Buat tujuan
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Tujuan aktif</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {goals.length === 0 ? (
            <EmptyState
              icon={<ProgressIcon className="size-5" />}
              title="Belum ada tujuan belajar"
              description="Buat tujuan pertamamu untuk mulai menemukan partner, kelompok, atau mentor."
              action={
                <Link
                  href="/goals/new"
                  className={buttonClasses("primary", "md", "no-underline")}
                >
                  Buat tujuan pertama
                </Link>
              }
            />
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">{goal.title}</h3>
                    <p className="text-xs text-muted">
                      {goal.topics?.name ?? "Tanpa topik"} ·{" "}
                      {supportModeLabels[goal.support_mode] ??
                        goal.support_mode}
                      {goal.target_date
                        ? ` · Target ${goal.target_date}`
                        : ""}
                    </p>
                  </div>
                  <StatusBadge
                    value={goal.status}
                    labels={learningGoalStatusLabels}
                    tones={learningGoalStatusTones}
                  />
                </div>
                {goal.description ? (
                  <p className="text-sm text-muted">{goal.description}</p>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-2">
                  <Link
                    href={`/goals/${goal.id}`}
                    className={buttonClasses("primary", "sm", "no-underline")}
                  >
                    Progres
                  </Link>
                  <Link
                    href={`/goals/${goal.id}/edit`}
                    className={buttonClasses("secondary", "sm", "no-underline")}
                  >
                    Ubah
                  </Link>
                  {goal.support_mode === "mentor" ||
                  goal.support_mode === "any" ? (
                    <Link
                      href="/discover"
                      className={buttonClasses(
                        "secondary",
                        "sm",
                        "no-underline",
                      )}
                    >
                      Cari mentor
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {goals.length === 0 && demoEnabled ? <DemoGoalsSection /> : null}
    </div>
  );
}
