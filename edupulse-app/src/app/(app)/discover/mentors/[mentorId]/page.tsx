import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { SafetyPanel } from "@/components/app/safety-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { getMentorWithServices } from "@/lib/data/mentors";
import { getBlockedUserIds } from "@/lib/data/partners";
import {
  deliveryModeLabels,
  labelFor,
  mentorVerificationLabels,
  mentorVerificationTones,
} from "@/lib/status";

interface MentorDetailPageProps {
  params: Promise<{ mentorId: string }>;
}

export const metadata: Metadata = { title: "Detail Mentor" };

export default async function MentorDetailPage({
  params,
}: MentorDetailPageProps) {
  const { mentorId } = await params;
  const user = await requireUser(`/discover/mentors/${mentorId}`);
  const mentor = await getMentorWithServices(mentorId);

  if (!mentor) {
    return (
      <div>
        <PageHeader title="Detail Mentor" />
        <EmptyState
          title="Mentor tidak ditemukan"
          description="Profil mentor ini tidak tersedia, sudah tidak aktif, atau tautannya salah."
          action={
            <Link
              href="/discover?tab=mentor"
              className={buttonClasses("primary", "md", "no-underline")}
            >
              Cari mentor lain
            </Link>
          }
        />
      </div>
    );
  }

  const blockedIds = await getBlockedUserIds(user.id);
  const isBlocked = blockedIds.has(mentorId);

  if (mentor.mentor.verification_status !== "verified") {
    return (
      <div>
        <PageHeader title={mentor.profile.display_name ?? "Mentor"} />
        <EmptyState
          title="Mentor belum terverifikasi"
          description="Hanya mentor yang terverifikasi yang dapat ditampilkan untuk booking aktif sesuai kebijakan MVP."
          action={
            <Link
              href="/discover?tab=mentor"
              className={buttonClasses("primary", "md", "no-underline")}
            >
              Cari mentor terverifikasi
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={mentor.profile.display_name ?? "Detail Mentor"}
        description={mentor.mentor.headline}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted">
                {mentor.mentor.expertise_summary}
              </p>
              {mentor.mentor.experience_years !== null && (
                <p className="mt-3 text-sm text-muted">
                  Pengalaman: {mentor.mentor.experience_years} tahun
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layanan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {mentor.services.length === 0 ? (
                <p className="text-sm text-muted">
                  Mentor ini belum memiliki layanan aktif.
                </p>
              ) : (
                mentor.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border p-4"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-base font-semibold">
                          {service.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {service.price_type === "free"
                          ? "Gratis"
                          : `Rp ${Number(service.price_amount).toLocaleString("id-ID")}`}
                        {service.price_type === "paid" && (
                          <span className="ml-1 text-xs text-muted">
                            ({service.currency})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted">
                      <span>Durasi: {service.duration_minutes} menit</span>
                      <span>
                        Mode: {labelFor(deliveryModeLabels, service.delivery_mode)}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      <span className="font-medium text-ink">
                        Ketentuan pembatalan:
                      </span>{" "}
                      {service.cancellation_policy}
                    </div>
                    <div className="mt-2">
                      <Link
                        href={`/discover/mentors/${mentorId}/book?serviceId=${service.id}`}
                        className={buttonClasses("primary", "sm", "no-underline")}
                      >
                        Ajukan sesi
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted">
              <div className="flex items-center justify-between gap-3">
                <span>Status verifikasi</span>
                <StatusBadge
                  value={mentor.mentor.verification_status}
                  labels={mentorVerificationLabels}
                  tones={mentorVerificationTones}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Menerima booking</span>
                <StatusBadge
                  value={mentor.mentor.is_accepting_bookings ? "yes" : "no"}
                  labels={{ yes: "Menerima", no: "Tidak menerima" }}
                  tones={{ yes: "success", no: "neutral" }}
                />
              </div>
            </CardContent>
          </Card>

          {mentor.profile.id !== user.id && (
            <Card>
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
              </CardHeader>
              <CardContent>
                <SafetyPanel
                  userId={mentor.profile.id}
                  displayName={mentor.profile.display_name ?? "mentor ini"}
                  isBlocked={isBlocked}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
