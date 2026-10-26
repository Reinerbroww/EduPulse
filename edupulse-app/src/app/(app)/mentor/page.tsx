import type { Metadata } from "next";
import Link from "next/link";

import { MentorCvCard } from "@/components/app/mentor-cv-card";
import { MentorVerificationSubmit } from "@/components/app/mentor-verification-submit";
import { PageHeader } from "@/components/app/page-header";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { getCurrentUserContext } from "@/lib/data/profile";
import {
  getMyMentorCv,
  getMyMentorProfile,
  listMyMentorServices,
  listMyMentorSlots,
} from "@/lib/data/mentor-self";
import { isDemoModeEnabled } from "@/lib/demo/fixtures";
import {
  deleteMentorService,
  deleteMentorSlot,
  toggleAcceptingBookings,
  toggleMentorServiceActive,
} from "@/lib/mentor/actions";
import {
  deliveryModeLabels,
  labelFor,
  mentorVerificationLabels,
  mentorVerificationTones,
  priceTypeLabels,
} from "@/lib/status";

export const metadata: Metadata = { title: "Ruang Mentor" };

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type FlowState = "done" | "current" | "todo";

interface FlowStep {
  label: string;
  hint: string;
  state: FlowState;
}

// The five-step onboarding path the product promises:
// buat profil -> lengkapi info -> unggah CV -> ajukan verifikasi -> menunggu
// keputusan. `verification_status` (not_submitted/pending/verified/rejected/
// suspended) drives steps 4-5; there is no separate "draft" value — a profile
// that has not been submitted yet IS the draft state.
function buildVerificationFlow(
  hasProfile: boolean,
  hasCv: boolean,
  status: string | null,
): FlowStep[] {
  const steps: FlowStep[] = [
    {
      label: "Buat profil mentor",
      hint: "Judul singkat, ringkasan keahlian, dan pengalaman.",
      state: hasProfile ? "done" : "current",
    },
    {
      label: "Lengkapi informasi profil",
      hint: "Pastikan informasi akurat sebelum diajukan.",
      state: hasProfile ? "done" : "todo",
    },
    {
      label: "Unggah CV (PDF, maks. 5 MB)",
      hint: "CV dibaca moderator selama peninjauan.",
      state: !hasProfile ? "todo" : hasCv ? "done" : "current",
    },
    {
      label: "Ajukan verifikasi",
      hint: "Tombol aktif setelah CV terunggah.",
      state: "todo",
    },
    {
      label: "Menunggu keputusan moderator",
      hint: "Status: menunggu, disetujui, ditolak, atau ditangguhkan.",
      state: "todo",
    },
  ];

  if (!hasProfile) return steps;

  if (status === "pending") {
    steps[3] = { ...steps[3], state: "done" };
    steps[4] = { ...steps[4], state: "current" };
  } else if (status === "verified") {
    steps[3] = { ...steps[3], state: "done" };
    steps[4] = { ...steps[4], state: "done" };
  } else {
    // not_submitted | rejected | suspended — CV decides whether step 4 is open.
    steps[3] = { ...steps[3], state: hasCv ? "current" : "todo" };
    steps[4] = { ...steps[4], state: "todo" };
  }

  return steps;
}

const FLOW_STATE_LABELS: Record<FlowState, string> = {
  done: "Selesai",
  current: "Saat ini",
  todo: "Berikutnya",
};

const FLOW_STATE_TONES: Record<FlowState, "success" | "info" | "neutral"> = {
  done: "success",
  current: "info",
  todo: "neutral",
};

function VerificationFlowCard({ steps }: { steps: FlowStep[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alur verifikasi mentor</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <li key={step.label} className="flex items-start gap-3">
              <span
                aria-hidden
                className={
                  step.state === "done"
                    ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                    : step.state === "current"
                      ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-semibold text-primary"
                      : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted"
                }
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      step.state === "todo"
                        ? "text-sm text-muted"
                        : "text-sm font-medium text-ink"
                    }
                  >
                    {step.label}
                  </span>
                  <Badge tone={FLOW_STATE_TONES[step.state]}>
                    {FLOW_STATE_LABELS[step.state]}
                  </Badge>
                </div>
                <p className="text-xs text-muted">{step.hint}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default async function MentorDashboardPage() {
  const user = await requireUser("/mentor");
  const [profile, services, slots, cvLookup, context] = await Promise.all([
    getMyMentorProfile(user.id),
    listMyMentorServices(user.id),
    listMyMentorSlots(user.id),
    getMyMentorCv(user.id),
    getCurrentUserContext(),
  ]);
  const accountProfile = context?.profile ?? null;

  const hasCv = Boolean(cvLookup.cv);
  const steps = buildVerificationFlow(
    Boolean(profile),
    hasCv,
    profile?.verification_status ?? null,
  );
  const demoEnabled = isDemoModeEnabled();

  if (!profile) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Ruang Mentor"
          description="Buat profil mentor untuk menawarkan sesi belajar."
        />
        <Alert tone="info">
          Menjadi mentor bersifat opsional. Status verifikasi dilakukan secara
          manual oleh tim EduPulse.
        </Alert>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <EmptyState
              title="Kamu belum punya profil mentor"
              description="Buat profil, unggah CV, lalu ajukan verifikasi. Setelah disetujui moderator, layanan dan jadwalmu tampil di pencarian mentor."
              action={
                <Link
                  href="/mentor/profile"
                  className={buttonClasses("primary", "md", "no-underline")}
                >
                  Buat profil mentor
                </Link>
              }
            />
          </div>
          <VerificationFlowCard steps={steps} />
        </div>
      </div>
    );
  }

  const canSubmitVerification =
    profile.verification_status === "not_submitted" ||
    profile.verification_status === "rejected";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ruang Mentor"
        description="Kelola profil, layanan, dan jadwal yang kamu tawarkan."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle>Profil mentor</CardTitle>
                <Link
                  href="/mentor/profile"
                  className={buttonClasses("secondary", "sm", "no-underline")}
                >
                  Ubah profil
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar
                  name={accountProfile?.display_name}
                  src={accountProfile?.avatar_url}
                  size="lg"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-ink">
                    {accountProfile?.display_name ?? "Mentor"}
                  </span>
                  <Link
                    href="/profile"
                    className={buttonClasses("ghost", "sm", "no-underline")}
                  >
                    Ubah foto profil
                  </Link>
                </div>
              </div>
              <h3 className="text-base font-semibold">{profile.headline}</h3>
              <p className="text-sm text-muted">
                {profile.expertise_summary}
              </p>
              {profile.experience_years != null ? (
                <p className="text-xs text-muted">
                  Pengalaman {profile.experience_years} tahun
                </p>
              ) : (
                <p className="text-xs text-muted">
                  Pengalaman belum dicantumkan
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle>Layanan</CardTitle>
                <Link
                  href="/mentor/services/new"
                  className={buttonClasses("primary", "sm", "no-underline")}
                >
                  Tambah layanan
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {services.length === 0 ? (
                <EmptyState
                  title="Belum ada layanan"
                  description="Tambahkan layanan agar calon murid tahu apa yang kamu tawarkan dan berapa durasinya."
                  action={
                    <Link
                      href="/mentor/services/new"
                      className={buttonClasses(
                        "primary",
                        "sm",
                        "no-underline",
                      )}
                    >
                      Tambah layanan
                    </Link>
                  }
                />
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold">
                          {service.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {service.description}
                        </p>
                      </div>
                      <StatusBadge
                        value={service.is_active ? "active" : "inactive"}
                        labels={{ active: "Aktif", inactive: "Nonaktif" }}
                        tones={{
                          active: "success",
                          inactive: "neutral",
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted">
                      <span>
                        {labelFor(priceTypeLabels, service.price_type)}
                        {service.price_type === "paid"
                          ? ` · Rp ${Number(service.price_amount).toLocaleString("id-ID")}`
                          : ""}
                      </span>
                      <span>{service.duration_minutes} menit</span>
                      <span>
                        {labelFor(deliveryModeLabels, service.delivery_mode)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <form action={toggleMentorServiceActive}>
                        <input
                          type="hidden"
                          name="serviceId"
                          value={service.id}
                        />
                        <SubmitButton
                          size="sm"
                          variant="secondary"
                          pendingLabel="Memproses…"
                        >
                          {service.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </SubmitButton>
                      </form>
                      <form action={deleteMentorService}>
                        <input
                          type="hidden"
                          name="serviceId"
                          value={service.id}
                        />
                        <SubmitButton
                          size="sm"
                          variant="danger"
                          pendingLabel="Memproses…"
                        >
                          Hapus
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle>Jadwal tersedia</CardTitle>
                <Link
                  href="/mentor/slots/new"
                  className={buttonClasses("primary", "sm", "no-underline")}
                >
                  Tambah jadwal
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {slots.length === 0 ? (
                <EmptyState
                  title="Belum ada jadwal mendatang"
                  description="Tentukan rentang waktu agar murid dapat mengajukan sesi pada jam yang cocok."
                  action={
                    <Link
                      href="/mentor/slots/new"
                      className={buttonClasses("primary", "sm", "no-underline")}
                    >
                      Tambah jadwal
                    </Link>
                  }
                />
              ) : (
                slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-card)] border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatDateTime(slot.starts_at)} —{" "}
                        {formatDateTime(slot.ends_at)}
                      </p>
                      <Badge tone="neutral">
                        {slot.status === "available"
                          ? "Tersedia"
                          : slot.status === "reserved"
                            ? "Terpesan"
                            : "Tidak tersedia"}
                      </Badge>
                    </div>
                    {slot.status === "available" && (
                      <form action={deleteMentorSlot}>
                        <input type="hidden" name="slotId" value={slot.id} />
                        <SubmitButton
                          size="sm"
                          variant="secondary"
                          pendingLabel="Memproses…"
                        >
                          Hapus
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <VerificationFlowCard steps={steps} />

          <Card>
            <CardHeader>
              <CardTitle>Status verifikasi</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <StatusBadge
                value={profile.verification_status}
                labels={mentorVerificationLabels}
                tones={mentorVerificationTones}
              />
              {canSubmitVerification ? (
                <MentorVerificationSubmit
                  mentorId={user.id}
                  hasCv={hasCv}
                />
              ) : (
                <p className="text-xs text-muted">
                  {profile.verification_status === "verified"
                    ? "Kamu sudah terverifikasi."
                    : profile.verification_status === "pending"
                      ? "Pengajuan verifikasi sedang ditinjau moderator."
                      : "Akun mentor kamu ditangguhkan. Hubungi tim EduPulse."}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dokumen CV</CardTitle>
            </CardHeader>
            <CardContent>
              <MentorCvCard
                cv={cvLookup.cv}
                unavailable={cvLookup.unavailable}
                canDelete={profile.verification_status !== "pending"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menerima sesi</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <StatusBadge
                value={profile.is_accepting_bookings ? "yes" : "no"}
                labels={{ yes: "Menerima pengajuan", no: "Tidak menerima" }}
                tones={{ yes: "success", no: "neutral" }}
              />
              <form action={toggleAcceptingBookings}>
                <input
                  type="hidden"
                  name="next"
                  value={String(!profile.is_accepting_bookings)}
                />
                <SubmitButton size="sm" variant="secondary" pendingLabel="Memproses…">
                  {profile.is_accepting_bookings
                    ? "Berhenti menerima"
                    : "Mulai menerima"}
                </SubmitButton>
              </form>
            </CardContent>
          </Card>

          {demoEnabled ? (
            <Card>
              <CardHeader>
                <CardTitle>Pratinjau tampilan publik</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-xs text-muted">
                  Lihat bagaimana calon murid menemukan mentor di halaman
                  pencarian.
                </p>
                <Link
                  href="/discover?tab=mentor"
                  className={buttonClasses("secondary", "sm", "no-underline")}
                >
                  Buka pencarian mentor
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="pt-4">
              <Link
                href="/discover?tab=mentor"
                className={buttonClasses("ghost", "sm", "no-underline")}
              >
                Lihat tampilan pencarian mentor →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
