import type { Metadata } from "next";

import { ModeratorVerificationActions } from "@/components/app/moderator-verification-actions";
import { PageHeader } from "@/components/app/page-header";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label, Select, Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import {
  isCurrentUserModerator,
  listPendingVerifications,
  listReports,
} from "@/lib/data/moderation";
import { resolveReport } from "@/lib/moderation/actions";
import { labelFor, reportReasonLabels, reportStatusLabels, reportStatusTones } from "@/lib/status";

export const metadata: Metadata = { title: "Ruang Moderator" };

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    dateStyle: "medium",
  });
}

export default async function ModeratorPage() {
  await requireUser("/moderator");
  const moderator = await isCurrentUserModerator();

  if (!moderator) {
    return (
      <EmptyState
        title="Akses terbatas"
        description="Halaman ini hanya untuk moderator EduPulse."
      />
    );
  }

  const [verifications, reports] = await Promise.all([
    listPendingVerifications(),
    listReports(["open", "in_review"]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ruang Moderator"
        description="Tinjau pengajuan verifikasi mentor dan tangani laporan pengguna."
      />

      <Card>
        <CardHeader>
          <CardTitle>Verifikasi mentor ({verifications.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {verifications.length === 0 ? (
            <EmptyState
              title="Tidak ada pengajuan verifikasi"
              description="Pengajuan mentor akan muncul di sini untuk ditinjau."
            />
          ) : (
            verifications.map((v) => (
              <div
                key={v.user_id}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink">
                    {v.display_name ?? "Mentor"}
                  </span>
                  <span className="text-xs text-muted">
                    Diajukan {formatDate(v.verification_submitted_at)}
                  </span>
                </div>
                <p className="text-sm font-medium">{v.headline}</p>
                <p className="whitespace-pre-wrap text-sm text-muted">
                  {v.expertise_summary}
                </p>
                {v.experience_years !== null && (
                  <p className="text-xs text-muted">
                    Pengalaman: {v.experience_years} tahun
                  </p>
                )}
                <ModeratorVerificationActions
                  mentorId={v.user_id}
                  hasCv={v.has_cv}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laporan pengguna ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {reports.length === 0 ? (
            <EmptyState
              title="Tidak ada laporan terbuka"
              description="Laporan pengguna yang perlu ditinjau akan muncul di sini."
            />
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">
                    {labelFor(reportReasonLabels, r.reason_code)}
                  </span>
                  <StatusBadge
                    value={r.status}
                    labels={reportStatusLabels}
                    tones={reportStatusTones}
                  />
                </div>
                <p className="text-xs text-muted">
                  Pelapor: {r.reporter_name ?? "Pengguna"} · Dilaporkan:{" "}
                  {r.reported_name ?? "Pengguna"} · {formatDate(r.created_at)}
                </p>
                {r.details && (
                  <p className="whitespace-pre-wrap text-sm">{r.details}</p>
                )}
                <form
                  action={resolveReport}
                  className="flex flex-col gap-3 border-t border-border pt-3"
                  noValidate
                >
                  <input type="hidden" name="reportId" value={r.id} />
                  <div className="flex flex-wrap items-center gap-2">
                    <Label htmlFor={`status-${r.id}`} className="text-muted">
                      Tindakan
                    </Label>
                    <Select
                      id={`status-${r.id}`}
                      name="status"
                      defaultValue="in_review"
                      className="h-9 w-auto px-2"
                    >
                      <option value="in_review">Tandai sedang ditinjau</option>
                      <option value="resolved">Selesai</option>
                      <option value="dismissed">Diabaikan</option>
                    </Select>
                  </div>
                  <Textarea
                    name="note"
                    maxLength={1000}
                    placeholder="Catatan internal (opsional, tidak terlihat pengguna)."
                  />
                  <div>
                    <SubmitButton size="sm" pendingLabel="Menyimpan…">
                      Simpan tindakan
                    </SubmitButton>
                  </div>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
