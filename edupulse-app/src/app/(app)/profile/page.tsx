import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { AvatarCard } from "@/components/app/avatar-card";
import { AvailabilityManager } from "@/components/app/availability-manager";
import { SubmitButton } from "@/components/auth/submit-button";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUserContext } from "@/lib/data/profile";
import { isCurrentUserModerator } from "@/lib/data/moderation";
import { listBlockedProfiles } from "@/lib/data/partners";
import { listMyAvailability } from "@/lib/data/settings";
import { unblockUser } from "@/lib/safety/actions";
import { educationLevelLabels, labelFor } from "@/lib/status";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const context = await getCurrentUserContext();
  const profile = context?.profile ?? null;
  const safety = context?.safety ?? null;
  const [blocked, isModerator, availability] = await Promise.all([
    listBlockedProfiles(user.id),
    isCurrentUserModerator(),
    listMyAvailability(user.id),
  ]);

  const rows: Array<{ label: string; value: string }> = [
    { label: "Nama tampilan", value: profile?.display_name ?? "-" },
    {
      label: "Jenjang pendidikan",
      value: labelFor(educationLevelLabels, profile?.education_level, "-"),
    },
    { label: "Zona waktu", value: profile?.timezone ?? "-" },
    { label: "Kelompok usia", value: safety?.age_band ?? "not_set" },
    {
      label: "Visibilitas profil",
      value:
        safety?.profile_visibility === "private"
          ? "Privat"
          : "Dapat ditemukan",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Profil"
        description="Data ini digunakan untuk pencocokan dan keselamatan."
        actions={
          <Link
            href="/onboarding"
            className={buttonClasses("secondary", "sm", "no-underline")}
          >
            Edit
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Informasi akun</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="text-muted">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Foto profil</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarCard
            avatarUrl={profile?.avatar_url ?? null}
            name={profile?.display_name ?? null}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Jadwal belajar</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityManager rows={availability} />
        </CardContent>
      </Card>

      {isModerator && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Moderasi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Tinjau pengajuan verifikasi mentor dan laporan pengguna.
            </p>
            <div>
              <Link
                href="/moderator"
                className={buttonClasses("secondary", "sm", "no-underline")}
              >
                Buka Ruang Moderator
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {blocked.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pengguna yang diblokir</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {blocked.map((entry) => (
              <div
                key={entry.blocked_user_id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border p-3"
              >
                <span className="text-sm font-medium text-ink">
                  {entry.display_name ?? "Pengguna"}
                </span>
                <form action={unblockUser}>
                  <input
                    type="hidden"
                    name="blockedUserId"
                    value={entry.blocked_user_id}
                  />
                  <SubmitButton
                    size="sm"
                    variant="secondary"
                    pendingLabel="Memproses…"
                  >
                    Buka blokir
                  </SubmitButton>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
