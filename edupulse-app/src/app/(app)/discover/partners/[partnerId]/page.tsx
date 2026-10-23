import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { PartnerRequestForm } from "@/components/app/partner-request-form";
import { SafetyPanel } from "@/components/app/safety-panel";
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
import { requireUser } from "@/lib/auth/guards";
import { getLearningGoals } from "@/lib/data/goals";
import { getPartnerDetail } from "@/lib/data/partners";
import {
  interestTypeLabels,
  skillLevelLabels,
  educationLevelLabels,
  supportModeLabels,
  partnerRequestStatusLabels,
  partnerRequestStatusTones,
  dayOfWeekLabels,
  labelFor,
} from "@/lib/status";

interface PartnerDetailPageProps {
  params: Promise<{ partnerId: string }>;
}

export const metadata: Metadata = { title: "Profil Partner" };

export default async function PartnerDetailPage({
  params,
}: PartnerDetailPageProps) {
  const { partnerId } = await params;
  const user = await requireUser(`/discover/partners/${partnerId}`);
  const [detail, myGoals] = await Promise.all([
    getPartnerDetail(partnerId),
    getLearningGoals(),
  ]);

  if (!detail) {
    return (
      <EmptyState
        title="Profil tidak tersedia"
        description="Profil ini mungkin bersifat privat atau sudah tidak dapat ditemukan."
      />
    );
  }

  const isSelf = detail.profile.id === user.id;
  const activeGoals = myGoals
    .filter((goal) => goal.status === "active")
    .map((goal) => ({ id: goal.id, title: goal.title }));

  const pendingOrAccepted =
    detail.request &&
    (detail.request.status === "pending" ||
      detail.request.status === "accepted");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={detail.profile.display_name ?? "Profil Partner"}
        description={
          detail.profile.education_level
            ? labelFor(educationLevelLabels, detail.profile.education_level)
            : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {detail.profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Tentang</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted">
                  {detail.profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Minat topik</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {detail.topics.length === 0 ? (
                <p className="text-sm text-muted">
                  Belum mencantumkan minat topik.
                </p>
              ) : (
                detail.topics.map((topic) => (
                  <div
                    key={topic.topic_id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-card)] border border-border p-3"
                  >
                    <span className="text-sm font-medium text-ink">
                      {topic.name}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      <Badge tone="neutral">
                        {labelFor(interestTypeLabels, topic.interest_type)}
                      </Badge>
                      <Badge tone="neutral">
                        {labelFor(skillLevelLabels, topic.skill_level)}
                      </Badge>
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tujuan belajar terbuka</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {detail.goals.length === 0 ? (
                <p className="text-sm text-muted">
                  Belum ada tujuan belajar yang dibuka untuk dicari partner.
                </p>
              ) : (
                detail.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-[var(--radius-card)] border border-border p-3"
                  >
                    <p className="text-sm font-medium text-ink">{goal.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {goal.topicName && (
                        <Badge tone="neutral">{goal.topicName}</Badge>
                      )}
                      <Badge tone="neutral">
                        {labelFor(supportModeLabels, goal.support_mode)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {!isSelf && (
            <Card>
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
              </CardHeader>
              <CardContent>
                <SafetyPanel
                  userId={detail.profile.id}
                  displayName={detail.profile.display_name ?? "pengguna ini"}
                  isBlocked={detail.blockedByMe}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Waktu luang</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {detail.availabilityDays.length === 0 ? (
                <p className="text-sm text-muted">
                  Belum mengatur waktu luang.
                </p>
              ) : (
                detail.availabilityDays.map((day) => (
                  <Badge key={day} tone="neutral">
                    {labelFor(dayOfWeekLabels, String(day))}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>

          {detail.reasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alasan cocok</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5">
                {detail.reasons.map((reason) => (
                  <p key={reason.label} className="text-sm text-muted">
                    {reason.label}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          {!isSelf && (
            <Card>
              <CardHeader>
                <CardTitle>Ajukan belajar bersama</CardTitle>
              </CardHeader>
              <CardContent>
                {detail.blockedByMe ? (
                  <Alert tone="warning">
                    Kamu memblokir pengguna ini. Buka blokir terlebih dahulu
                    untuk mengirim permintaan.
                  </Alert>
                ) : pendingOrAccepted && detail.request ? (
                  <div className="flex flex-col gap-3">
                    <StatusBadge
                      value={detail.request.status}
                      labels={partnerRequestStatusLabels}
                      tones={partnerRequestStatusTones}
                    />
                    <p className="text-sm text-muted">
                      {detail.request.requester_id === user.id
                        ? "Permintaanmu sedang menunggu jawaban."
                        : "Ada permintaan untukmu dari pengguna ini."}
                    </p>
                    <Link
                      href="/requests"
                      className="text-sm font-medium text-primary no-underline"
                    >
                      Buka halaman permintaan
                    </Link>
                  </div>
                ) : (
                  <PartnerRequestForm
                    recipientId={detail.profile.id}
                    goals={activeGoals}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
