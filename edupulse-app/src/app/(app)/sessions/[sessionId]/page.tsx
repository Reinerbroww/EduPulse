import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import {
  getMySessionMembership,
  getSessionDetail,
} from "@/lib/data/sessions";
import {
  addChecklistItem,
  addSessionNote,
  joinSession,
  leaveSession,
  toggleChecklistItem,
} from "@/lib/sessions/actions";
import {
  sessionMemberRoleLabels,
  sessionMemberStatusLabels,
  sessionMemberStatusTones,
  sessionStatusLabels,
  sessionStatusTones,
} from "@/lib/status";

export const metadata: Metadata = { title: "Sesi belajar" };

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await requireUser(`/sessions/${sessionId}`);

  const [detail, membership] = await Promise.all([
    getSessionDetail(sessionId),
    getMySessionMembership(sessionId, user.id),
  ]);

  if (!detail) notFound();

  const { session, members, checklist, notes } = detail;
  const isParticipant = membership !== null;
  const isOrganizer = session.created_by === user.id;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={session.title}
        description={
          session.objectives ?? "Sesi belajar tanpa tujuan tambahan."
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Mulai</span>
                <span className="font-medium">
                  {formatDateTime(session.starts_at)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Selesai</span>
                <span className="font-medium">
                  {formatDateTime(session.ends_at)}
                </span>
              </div>
              {session.external_meeting_url ? (
                <a
                  href={session.external_meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Buka tautan pertemuan
                </a>
              ) : null}
            </CardContent>
          </Card>

          {isParticipant ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Daftar periksa</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {checklist.length === 0 ? (
                    <p className="text-sm text-muted">
                      Belum ada item daftar periksa. Tambahkan langkah pertama di
                      bawah.
                    </p>
                  ) : (
                    checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <span
                          className={
                            item.is_completed
                              ? "text-sm line-through text-muted"
                              : "text-sm"
                          }
                        >
                          {item.title}
                        </span>
                        <form action={toggleChecklistItem}>
                          <input
                            type="hidden"
                            name="sessionId"
                            value={sessionId}
                          />
                          <input type="hidden" name="itemId" value={item.id} />
                          <input
                            type="hidden"
                            name="completed"
                            value={String(item.is_completed)}
                          />
                          <button
                            type="submit"
                            className={buttonClasses("secondary", "sm")}
                          >
                            {item.is_completed ? "Batal" : "Selesai"}
                          </button>
                        </form>
                      </div>
                    ))
                  )}

                  <form
                    action={addChecklistItem}
                    className="mt-2 flex items-end gap-2"
                  >
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <Input
                      name="title"
                      placeholder="Item baru…"
                      maxLength={200}
                      className="flex-1"
                    />
                    <button
                      type="submit"
                      className={buttonClasses("primary", "md")}
                    >
                      Tambah
                    </button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Catatan</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted">
                      Belum ada catatan. Tulis ringkasan atau pertanyaanmu di
                      bawah.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-[var(--radius-card)] border border-border p-3"
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {note.profiles?.display_name ?? "Pengguna"}
                          {note.is_shared ? " · dibagikan" : " · pribadi"}
                        </p>
                      </div>
                    ))
                  )}

                  <form
                    action={addSessionNote}
                    className="flex flex-col gap-2"
                  >
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <Textarea
                      name="content"
                      placeholder="Tulis catatan…"
                      maxLength={4000}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isShared" defaultChecked />
                      Bagikan ke semua peserta
                    </label>
                    <div>
                      <button
                        type="submit"
                        className={buttonClasses("primary", "md")}
                      >
                        Simpan catatan
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted">
                Ikut sesi untuk melihat daftar periksa dan catatan.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center gap-3">
                <span className="text-muted">Status sesi</span>
                <StatusBadge
                  value={session.status}
                  labels={sessionStatusLabels}
                  tones={sessionStatusTones}
                />
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {!isParticipant ? (
                  <form action={joinSession}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <button
                      type="submit"
                      className={buttonClasses("primary", "md", "w-full")}
                    >
                      Ikut sesi
                    </button>
                  </form>
                ) : !isOrganizer ? (
                  <form action={leaveSession}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <button
                      type="submit"
                      className={buttonClasses("secondary", "md", "w-full")}
                    >
                      Keluar dari sesi
                    </button>
                  </form>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {isParticipant ? (
            <Card>
              <CardHeader>
                <CardTitle>Peserta ({members.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={member.profiles?.display_name} size="sm" />
                      <div>
                        <p className="text-sm font-medium">
                          {member.profiles?.display_name ?? "Pengguna"}
                        </p>
                        <p className="text-xs text-muted">
                          {sessionMemberRoleLabels[member.role] ?? member.role}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      value={member.status}
                      labels={sessionMemberStatusLabels}
                      tones={sessionMemberStatusTones}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {session.group_id ? (
            <Card>
              <CardContent className="pt-4">
                <Link
                  href={`/groups/${session.group_id}`}
                  className={buttonClasses("ghost", "sm", "no-underline")}
                >
                  ← Kembali ke kelompok
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
