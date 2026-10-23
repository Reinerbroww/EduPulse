import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { GoalProgressForm } from "@/components/app/goal-progress-form";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import { getGoalProgress } from "@/lib/data/mentoring";
import {
  learningGoalStatusLabels,
  learningGoalStatusTones,
  supportModeLabels,
} from "@/lib/status";

interface GoalProgressPageProps {
  params: Promise<{ goalId: string }>;
}

export const metadata: Metadata = { title: "Progres Belajar" };

export default async function GoalProgressPage({
  params,
}: GoalProgressPageProps) {
  const { goalId } = await params;
  const user = await requireUser(`/goals/${goalId}`);
  const progress = await getGoalProgress(goalId, user.id);

  if (!progress) {
    return (
      <EmptyState
        title="Tujuan tidak ditemukan"
        description="Tujuan ini tidak tersedia atau bukan milikmu."
      />
    );
  }

  const { goal, updates, latestPercent, isOwner } = progress;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={goal.title}
        description={goal.description ?? "Progres belajar berdasarkan aktivitas yang kamu catat."}
        actions={
          <div className="flex flex-wrap gap-2">
            {isOwner ? (
              <Link
                href={`/goals/${goalId}/edit`}
                className={buttonClasses("secondary", "sm", "no-underline")}
              >
                Ubah tujuan
              </Link>
            ) : null}
            <Link
              href="/goals"
              className={buttonClasses("secondary", "sm", "no-underline")}
            >
              Semua tujuan
            </Link>
          </div>
        }
      />

      {!isOwner && (
        <Alert tone="info">
          Kamu melihat tujuan ini sebagai pengamat. Hanya pemilik tujuan yang
          dapat mencatat progres.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Progres saat ini</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted">
                  {latestPercent}% berdasarkan catatan terakhirmu
                </span>
                <StatusBadge
                  value={goal.status}
                  labels={learningGoalStatusLabels}
                  tones={learningGoalStatusTones}
                />
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-valuenow={latestPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-primary"
                  style={{ width: `${latestPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted">
                Progres berasal dari catatanmu sendiri, bukan penilaian
                penguasaan materi otomatis.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted">
                <span>
                  Dukungan:{" "}
                  {supportModeLabels[goal.support_mode] ?? goal.support_mode}
                </span>
                {goal.target_date && <span>Target: {goal.target_date}</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat aktivitas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {updates.length === 0 ? (
                <p className="text-sm text-muted">
                  Belum ada catatan progres.
                </p>
              ) : (
                updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-[var(--radius-card)] border border-border p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {update.progress_percent}%
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(update.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                    {update.update_text && (
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {update.update_text}
                      </p>
                    )}
                    {update.next_step && (
                      <p className="mt-1 text-sm text-muted">
                        Langkah berikutnya: {update.next_step}
                      </p>
                    )}
                    {update.source_label && (
                      <p className="mt-1 text-xs text-muted">
                        {update.source_label}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {isOwner ? (
            <Card>
              <CardHeader>
                <CardTitle>Catat progres</CardTitle>
              </CardHeader>
              <CardContent>
                <GoalProgressForm
                  goalId={goalId}
                  defaultPercent={latestPercent}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
