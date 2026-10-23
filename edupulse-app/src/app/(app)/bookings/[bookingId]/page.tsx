import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { BookingActions } from "@/components/app/booking-actions";
import { MentorFeedbackForm } from "@/components/app/mentor-feedback-form";
import { SafetyPanel } from "@/components/app/safety-panel";
import { SessionSummaryForm } from "@/components/app/session-summary-form";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { getBookingDetail } from "@/lib/data/mentoring";
import { getBlockedUserIds } from "@/lib/data/partners";
import {
  bookingStatusLabels,
  bookingStatusTones,
  priceTypeLabels,
} from "@/lib/status";

interface BookingDetailPageProps {
  params: Promise<{ bookingId: string }>;
}

export const metadata: Metadata = { title: "Ringkasan Sesi" };

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { bookingId } = await params;
  const user = await requireUser(`/bookings/${bookingId}`);
  const detail = await getBookingDetail(bookingId, user.id);

  if (!detail) {
    return (
      <EmptyState
        title="Sesi tidak ditemukan"
        description="Sesi ini tidak tersedia atau kamu bukan pesertanya."
      />
    );
  }

  const { booking, summary, feedback, isLearner, isMentor } = detail;
  const counterpartId = isLearner ? booking.mentor_id : booking.learner_id;
  const counterpartName = isLearner
    ? detail.mentorName ?? "Mentor"
    : detail.learnerName ?? "Pembelajar";
  const blockedIds =
    isLearner || isMentor ? await getBlockedUserIds(user.id) : new Set<string>();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={booking.service_title_snapshot}
        description={`Sesi mentoring dengan ${counterpartName}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Konteks sesi</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Jadwal</span>
                <span className="font-medium">
                  {formatDateTime(booking.starts_at)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Status</span>
                <StatusBadge
                  value={booking.status}
                  labels={bookingStatusLabels}
                  tones={bookingStatusTones}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted">Tujuanmu</span>
                <span className="whitespace-pre-wrap">
                  {booking.learner_objective}
                </span>
              </div>
              {detail.goalTitle && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Tujuan belajar</span>
                  {booking.learning_goal_id ? (
                    <Link
                      href={`/goals/${booking.learning_goal_id}`}
                      className="font-medium text-primary no-underline"
                    >
                      {detail.goalTitle} →
                    </Link>
                  ) : (
                    <span className="font-medium">{detail.goalTitle}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {isLearner || isMentor ? (
            <BookingActions
              bookingId={bookingId}
              role={isMentor ? "mentor" : "learner"}
              status={booking.status}
            />
          ) : null}

          {(summary ||
            booking.status === "confirmed" ||
            booking.status === "completed") && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan sesi</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {summary ? (
                  <div className="rounded-[var(--radius-card)] border border-border p-4">
                    <p className="text-xs text-muted">
                      {summary.author_id === user.id
                        ? "Ditulis olehmu"
                        : "Ditulis oleh pihak lain"}{" "}
                      · {new Date(summary.created_at).toLocaleDateString("id-ID")}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {summary.summary}
                    </p>
                    {summary.next_steps && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                        Langkah berikutnya: {summary.next_steps}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Belum ada ringkasan untuk sesi ini.
                  </p>
                )}

                {!summary || summary.author_id === user.id ? (
                  <SessionSummaryForm
                    bookingId={bookingId}
                    defaultSummary={summary?.summary}
                    defaultNextSteps={summary?.next_steps ?? undefined}
                  />
                ) : null}
              </CardContent>
            </Card>
          )}

          {isLearner && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {feedback ? (
                  <div className="rounded-[var(--radius-card)] border border-border p-4">
                    <div className="flex items-center gap-2">
                      <Badge tone="info">Rating {feedback.rating}/5</Badge>
                      <span className="text-xs text-muted">
                        {new Date(feedback.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                    {feedback.comment && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        {feedback.comment}
                      </p>
                    )}
                  </div>
                ) : booking.status === "completed" ? (
                  <p className="text-sm text-muted">
                    Sesi sudah selesai. Bagikan pengalamanmu.
                  </p>
                ) : (
                  <Alert tone="info">
                    Feedback dapat diberikan setelah sesi ditandai selesai.
                  </Alert>
                )}

                {booking.status === "completed" && (
                  <MentorFeedbackForm
                    bookingId={bookingId}
                    defaultRating={feedback?.rating}
                    defaultComment={feedback?.comment ?? undefined}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {isMentor && feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback pembelajar</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Badge tone="info">Rating {feedback.rating}/5</Badge>
                {feedback.comment && (
                  <p className="whitespace-pre-wrap text-sm">
                    {feedback.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail sesi</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Selesai</span>
                <span className="font-medium">
                  {formatDateTime(booking.ends_at)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Tipe harga</span>
                <span className="font-medium">
                  {priceTypeLabels[booking.price_type_snapshot] ??
                    booking.price_type_snapshot}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
            </CardHeader>
            <CardContent>
              <SafetyPanel
                userId={counterpartId}
                displayName={counterpartName}
                isBlocked={blockedIds.has(counterpartId)}
                mentorBookingId={bookingId}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <Link
                href="/dashboard"
                className={buttonClasses("ghost", "sm", "no-underline")}
              >
                ← Kembali ke dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
