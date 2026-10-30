import type { Metadata } from "next";
import Link from "next/link";

import { DemoBadge } from "@/components/app/demo-groups";
import { DemoGoalsPreview } from "@/components/app/demo-goals";
import { PageHeader } from "@/components/app/page-header";
import { CalendarIcon } from "@/components/brand/icons";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUserContext } from "@/lib/data/profile";
import { getActiveGoalCount } from "@/lib/data/goals";
import {
  getMyUpcomingSessions,
  type UpcomingSessionKind,
} from "@/lib/data/upcoming-sessions";
import { isDemoModeEnabled, DEMO_DASHBOARD_DISCLAIMER, DEMO_LABEL } from "@/lib/demo/fixtures";
import {
  bookingStatusLabels,
  bookingStatusTones,
  educationLevelLabels,
  labelFor,
  sessionStatusLabels,
  sessionStatusTones,
} from "@/lib/status";

const SESSION_KIND_LABELS: Record<UpcomingSessionKind, string> = {
  mentoring: "Mentoring",
  group: "Kelompok",
  partner: "Partner",
};

const SESSION_KIND_TONES: Record<
  UpcomingSessionKind,
  "info" | "neutral" | "accent"
> = {
  mentoring: "info",
  group: "neutral",
  partner: "accent",
};

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const user = await requireUser("/dashboard");
  const sp = await searchParams;
  const context = await getCurrentUserContext();

  const profile = context?.profile ?? null;
  const safety = context?.safety ?? null;
  const displayName = profile?.display_name ?? "Pelajar";
  const isMinor = safety?.age_band === "under_18";

  const [activeGoalCount, upcomingSessions] = await Promise.all([
    getActiveGoalCount(user.id),
    getMyUpcomingSessions(user.id),
  ]);

  const demoEnabled = isDemoModeEnabled();
  const isAccountEmpty =
    activeGoalCount === 0 && upcomingSessions.length === 0;

  return (
    <div>
      <PageHeader
        title={`Halo, ${displayName}`}
        description="Ringkasan perjalanan belajarmu di EduPulse."
        actions={
          <Link
            href="/onboarding"
            className={buttonClasses("secondary", "sm", "no-underline")}
          >
            Edit profil belajar
          </Link>
        }
      />

      {sp.booking === "success" ? (
        <Alert tone="success" className="mb-6">
          Pengajuan sesi mentoring berhasil dikirim. Slot telah dialokasikan dan
          menunggu konfirmasi mentor.
        </Alert>
      ) : null}

      {!profile || !profile.onboarding_completed ? (
        <Alert tone="info" className="mb-6">
          Selesaikan onboarding untuk mengaktifkan pencarian partner, kelompok,
          dan mentor.{" "}
          <Link href="/onboarding" className="font-medium text-primary">
            Lanjutkan onboarding
          </Link>
        </Alert>
      ) : null}

      {isMinor ? (
        <Alert tone="warning" className="mb-6">
          Karena akunmu terdaftar di bawah 18 tahun, fitur mentoring belum
          tersedia. Kamu tetap dapat menggunakan partner dan kelompok belajar.
        </Alert>
      ) : null}

      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted">
              Tujuan belajar aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-3xl font-semibold">{activeGoalCount}</p>
            <Link
              href="/goals/new"
              className={buttonClasses("secondary", "sm", "no-underline")}
            >
              Buat tujuan
            </Link>
          </CardContent>
        </Card>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>Sesi belajar mendatang</CardTitle>
              <Badge tone="info">{upcomingSessions.length} sesi</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {upcomingSessions.length === 0 ? (
                <EmptyState
                  icon={<CalendarIcon className="size-5" />}
                  title="Belum ada sesi"
                  description="Temukan partner, kelompok, atau mentor untuk mengisi jadwal belajarmu."
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Link
                        href="/discover"
                        className={buttonClasses(
                          "primary",
                          "sm",
                          "no-underline",
                        )}
                      >
                        Jelajahi partner & kelompok
                      </Link>
                      <Link
                        href="/discover?tab=mentor"
                        className={buttonClasses(
                          "secondary",
                          "sm",
                          "no-underline",
                        )}
                      >
                        Cari mentor
                      </Link>
                    </div>
                  }
                />
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-card)] border border-border p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={SESSION_KIND_TONES[session.kind]}>
                          {SESSION_KIND_LABELS[session.kind]}
                        </Badge>
                        <p className="text-sm font-medium">{session.title}</p>
                      </div>
                      <p className="text-xs text-muted">
                        {session.context ? `${session.context} · ` : ""}
                        {new Date(session.starts_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        value={session.status}
                        labels={
                          session.kind === "mentoring"
                            ? bookingStatusLabels
                            : sessionStatusLabels
                        }
                        tones={
                          session.kind === "mentoring"
                            ? bookingStatusTones
                            : sessionStatusTones
                        }
                      />
                      <Link
                        href={session.href}
                        className={buttonClasses(
                          "secondary",
                          "sm",
                          "no-underline",
                        )}
                      >
                        Lihat sesi
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profil belajar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Nama</span>
              <span className="font-medium">{displayName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Jenjang</span>
              <span className="font-medium">
                {labelFor(educationLevelLabels, profile?.education_level, "-")}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Zona waktu</span>
              <span className="font-medium">{profile?.timezone ?? "-"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Visibilitas</span>
              <span className="font-medium">
                {safety?.profile_visibility === "private"
                  ? "Privat"
                  : "Dapat ditemukan"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAccountEmpty && demoEnabled ? (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">
              Pratinjau saat akunmu aktif
            </h2>
            <DemoBadge />
          </div>
          <Alert tone="warning" role="alert">
            <strong className="font-semibold">
              {DEMO_LABEL} — bukan data nyata.
            </strong>{" "}
            {DEMO_DASHBOARD_DISCLAIMER}
          </Alert>
          <div className="grid gap-4 sm:grid-cols-2">
            <DemoGoalsPreview />
            <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    Sesi mentoring (contoh)
                  </p>
                  <p className="text-xs text-muted">
                    Sabtu, 14.00–15.00
                  </p>
                </div>
                <DemoBadge />
              </div>
              <p className="text-xs text-muted">
                Sesi contoh untuk memperlihatkan tampilan kartu sesi mendatang.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/goals/new"
              className={buttonClasses("primary", "md", "no-underline")}
            >
              Buat tujuan pertama
            </Link>
            <Link
              href="/discover"
              className={buttonClasses("secondary", "md", "no-underline")}
            >
              Jelajahi partner & kelompok
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
