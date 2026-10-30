import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DemoGroupsSection } from "@/components/app/demo-groups";
import { PageHeader } from "@/components/app/page-header";
import { UsersIcon } from "@/components/brand/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import {
  listVisibleGroups,
  listMyMemberships,
  type GroupListItem,
} from "@/lib/data/groups";
import { getGroupCover } from "@/lib/groups/covers";
import { isDemoModeEnabled } from "@/lib/demo/fixtures";
import {
  groupMemberStatusLabels,
  groupMemberStatusTones,
  groupVisibilityLabels,
  groupStatusLabels,
  groupStatusTones,
} from "@/lib/status";

export const metadata: Metadata = { title: "Kelompok belajar" };

export default async function GroupsPage() {
  const user = await requireUser("/groups");
  const [groups, memberships] = await Promise.all([
    listVisibleGroups(),
    listMyMemberships(user.id),
  ]);

  const membershipByGroup = new Map(memberships.map((m) => [m.group_id, m]));
  const demoEnabled = isDemoModeEnabled();

  const myGroups = groups.filter((g) => membershipByGroup.has(g.id));
  const otherGroups = groups.filter(
    (g) =>
      !membershipByGroup.has(g.id) &&
      g.visibility === "public" &&
      g.status === "active",
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kelompok belajar"
        description="Buat atau temukan kelompok dengan topik dan tujuan yang sama."
        actions={
          <Link
            href="/groups/new"
            className={buttonClasses("primary", "md", "no-underline")}
          >
            Buat kelompok
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kelompok saya</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {myGroups.length === 0 ? (
              <EmptyState
                icon={<UsersIcon className="size-5" />}
                title="Kamu belum bergabung ke kelompok"
                description="Kelompok yang kamu ikuti akan muncul di sini. Temukan kelompok publik atau buat kelompok baru."
                action={
                  <Link
                    href="/discover?tab=kelompok"
                    className={buttonClasses("secondary", "md", "no-underline")}
                  >
                    Temukan kelompok
                  </Link>
                }
              />
            ) : (
              myGroups.map((group) => (
                <GroupRow
                  key={group.id}
                  group={group}
                  membershipStatus={
                    membershipByGroup.get(group.id)?.status ?? null
                  }
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kelompok publik</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {otherGroups.length === 0 ? (
              <EmptyState
                icon={<UsersIcon className="size-5" />}
                title="Belum ada kelompok publik"
                description="Jadilah yang pertama membuat kelompok belajar, atau ajak teman bergabung."
                action={
                  <Link
                    href="/groups/new"
                    className={buttonClasses("primary", "md", "no-underline")}
                  >
                    Buat kelompok
                  </Link>
                }
              />
            ) : (
              otherGroups.map((group) => (
                <GroupRow key={group.id} group={group} />
              ))
            )}
          </CardContent>
        </Card>

        {demoEnabled && groups.length === 0 ? <DemoGroupsSection /> : null}
      </div>
    </div>
  );
}

function GroupRow({
  group,
  membershipStatus,
}: {
  group: GroupListItem;
  membershipStatus?: string | null;
}) {
  const activeCount = group.study_group_members?.[0]?.count ?? 0;
  const cover = getGroupCover(group.cover_image_key);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border p-4">
      <div className="flex items-center gap-3">
        <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            unoptimized
            sizes="80px"
            className="object-cover"
          />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{group.name}</h3>
            {membershipStatus ? (
              <StatusBadge
                value={membershipStatus}
                labels={groupMemberStatusLabels}
                tones={groupMemberStatusTones}
              />
            ) : null}
          </div>
          <p className="text-xs text-muted">
            {group.topics?.name ?? "Tanpa topik"} ·{" "}
            {groupVisibilityLabels[group.visibility] ?? group.visibility} ·{" "}
            {activeCount}/{group.max_members} anggota
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge
          value={group.status}
          labels={groupStatusLabels}
          tones={groupStatusTones}
        />
        <Link
          href={`/groups/${group.id}`}
          className={buttonClasses("secondary", "sm", "no-underline")}
        >
          Lihat
        </Link>
      </div>
    </div>
  );
}
