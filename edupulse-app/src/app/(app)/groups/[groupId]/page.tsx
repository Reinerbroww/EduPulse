import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { DemoSessionsSection } from "@/components/app/demo-sessions";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import {
  getGroupDetail,
  getMyMembership,
  type GroupMemberRow,
} from "@/lib/data/groups";
import { getGroupCover } from "@/lib/groups/covers";
import { isDemoModeEnabled } from "@/lib/demo/fixtures";
import { listGroupSessions } from "@/lib/data/sessions";
import {
  respondJoinRequest,
  requestJoinGroup,
  leaveGroup,
} from "@/lib/groups/actions";
import {
  groupMemberRoleLabels,
  groupMemberStatusLabels,
  groupMemberStatusTones,
  groupStatusLabels,
  groupStatusTones,
  groupVisibilityLabels,
  sessionStatusLabels,
  sessionStatusTones,
} from "@/lib/status";

export const metadata: Metadata = { title: "Detail Kelompok" };

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const user = await requireUser(`/groups/${groupId}`);

  const detail = await getGroupDetail(groupId);
  if (!detail) notFound();

  const membership = await getMyMembership(groupId, user.id);
  const sessions = await listGroupSessions(groupId);
  const { group, members } = detail;

  const isOwner = group.owner_id === user.id;
  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");
  const isActiveMember = membership?.status === "active";
  const isPending = membership?.status === "pending";
  const isFull = activeMembers.length >= group.max_members;
  const cover = getGroupCover(group.cover_image_key);
  const demoEnabled = isDemoModeEnabled();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={group.name}
        description={
          group.description ??
          "Kelompok belajar tanpa deskripsi tambahan."
        }
      />

      <div className="relative h-36 w-full overflow-hidden rounded-[var(--radius-card)] border border-border sm:h-48">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Anggota ({activeMembers.length}/{group.max_members})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {activeMembers.map((member) => (
                <MemberRow key={member.user_id} member={member} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesi belajar ({sessions.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted">Belum ada sesi.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{session.title}</p>
                      <p className="text-xs text-muted">
                        {new Date(session.starts_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        value={session.status}
                        labels={sessionStatusLabels}
                        tones={sessionStatusTones}
                      />
                      <Link
                        href={`/sessions/${session.id}`}
                        className={buttonClasses("secondary", "sm", "no-underline")}
                      >
                        Lihat
                      </Link>
                    </div>
                  </div>
                ))
              )}

              {isActiveMember && group.status === "active" ? (
                <Link
                  href={`/groups/${groupId}/sessions/new`}
                  className={buttonClasses("primary", "md", "self-start no-underline")}
                >
                  Buat sesi baru
                </Link>
              ) : null}
            </CardContent>
          </Card>

          {sessions.length === 0 && demoEnabled ? (
            <DemoSessionsSection groupId={isActiveMember ? groupId : undefined} />
          ) : null}

          {isOwner && pendingMembers.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Permintaan bergabung</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {pendingMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={member.profiles?.display_name} size="sm" />
                      <span className="text-sm font-medium">
                        {member.profiles?.display_name ?? "Pengguna"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <form action={respondJoinRequest}>
                        <input type="hidden" name="groupId" value={groupId} />
                        <input
                          type="hidden"
                          name="memberId"
                          value={member.user_id}
                        />
                        <input type="hidden" name="decision" value="approve" />
                        <button
                          type="submit"
                          className={buttonClasses("primary", "sm")}
                          disabled={isFull}
                        >
                          Terima
                        </button>
                      </form>
                      <form action={respondJoinRequest}>
                        <input type="hidden" name="groupId" value={groupId} />
                        <input
                          type="hidden"
                          name="memberId"
                          value={member.user_id}
                        />
                        <input type="hidden" name="decision" value="reject" />
                        <button
                          type="submit"
                          className={buttonClasses("secondary", "sm")}
                        >
                          Tolak
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted">
              <div className="flex justify-between gap-3">
                <span>Status kelompok</span>
                <StatusBadge
                  value={group.status}
                  labels={groupStatusLabels}
                  tones={groupStatusTones}
                />
              </div>
              <div className="flex justify-between gap-3">
                <span>Visibilitas</span>
                <span className="font-medium">
                  {groupVisibilityLabels[group.visibility] ?? group.visibility}
                </span>
              </div>
              {membership ? (
                <div className="flex justify-between items-center gap-3">
                  <span>Keanggotaanmu</span>
                  <StatusBadge
                    value={membership.status}
                    labels={groupMemberStatusLabels}
                    tones={groupMemberStatusTones}
                  />
                </div>
              ) : null}

              <div className="mt-2 flex flex-col gap-2">
                {!membership && group.status === "active" ? (
                  <form action={requestJoinGroup}>
                    <input type="hidden" name="groupId" value={groupId} />
                    <button
                      type="submit"
                      className={buttonClasses("primary", "md", "w-full")}
                      disabled={isFull}
                    >
                      {isFull ? "Kelompok penuh" : "Minta bergabung"}
                    </button>
                  </form>
                ) : null}

                {isPending ? (
                  <p className="text-xs text-muted">
                    Permintaanmu menunggu persetujuan pemilik.
                  </p>
                ) : null}

                {isActiveMember && !isOwner ? (
                  <form action={leaveGroup}>
                    <input type="hidden" name="groupId" value={groupId} />
                    <button
                      type="submit"
                      className={buttonClasses("secondary", "md", "w-full")}
                    >
                      Keluar dari kelompok
                    </button>
                  </form>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigasi</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/groups"
                className={buttonClasses("ghost", "sm", "no-underline")}
              >
                ← Semua kelompok
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: GroupMemberRow }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border p-3">
      <div className="flex items-center gap-3">
        <Avatar name={member.profiles?.display_name} size="sm" />
        <div>
          <p className="text-sm font-medium">
            {member.profiles?.display_name ?? "Pengguna"}
          </p>
          <p className="text-xs text-muted">
            {groupMemberRoleLabels[member.role] ?? member.role}
          </p>
        </div>
      </div>
      <StatusBadge
        value={member.status}
        labels={groupMemberStatusLabels}
        tones={groupMemberStatusTones}
      />
    </div>
  );
}
