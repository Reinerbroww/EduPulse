import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { DemoGroupsSection } from "@/components/app/demo-groups";
import { DemoMentorsSection } from "@/components/app/demo-mentors";
import { DemoPartnersSection } from "@/components/app/demo-partners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { getVerifiedMentors } from "@/lib/data/mentors";
import { listMatchCandidates } from "@/lib/data/partners";
import { listVisibleGroups } from "@/lib/data/groups";
import { isDemoModeEnabled } from "@/lib/demo/fixtures";
import { labelFor, educationLevelLabels, groupVisibilityLabels } from "@/lib/status";

export const metadata: Metadata = { title: "Jelajahi" };

const TABS = [
  { key: "partner", label: "Partner" },
  { key: "kelompok", label: "Kelompok" },
  { key: "mentor", label: "Mentor" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface DiscoverPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  await requireUser("/discover");
  const params = await searchParams;
  const activeTab: TabKey = TABS.some((t) => t.key === params.tab)
    ? (params.tab as TabKey)
    : "partner";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jelajahi"
        description="Temukan partner belajar, kelompok, dan mentor yang cocok dengan tujuanmu."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Jenis pencarian"
          className="flex gap-1 rounded-[var(--radius-control)] border border-border p-1"
        >
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/discover?tab=${tab.key}`}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={
                activeTab === tab.key
                  ? buttonClasses("primary", "sm", "no-underline")
                  : buttonClasses("ghost", "sm", "no-underline")
              }
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <Link
          href="/requests"
          className={buttonClasses("secondary", "sm", "no-underline")}
        >
          Permintaan belajar
        </Link>
      </div>

      {activeTab === "partner" && <PartnerTab />}
      {activeTab === "kelompok" && <KelompokTab />}
      {activeTab === "mentor" && <MentorTab />}
    </div>
  );
}

async function PartnerTab() {
  const candidates = await listMatchCandidates();
  const demo = isDemoModeEnabled();

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          title="Belum ada rekomendasi partner"
          description="Tambahkan minat topik, tujuan belajar, dan waktu luang di profilmu agar kami bisa mencocokkanmu dengan partner yang relevan."
          action={
            <Link
              href="/onboarding"
              className={buttonClasses("primary", "md", "no-underline")}
            >
              Lengkapi profil belajar
            </Link>
          }
        />
        {demo ? <DemoPartnersSection /> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <Card key={candidate.profile.id}>
          <CardHeader className="flex flex-row items-start gap-3">
            <Avatar
              name={candidate.profile.display_name}
              src={candidate.profile.avatar_url}
            />
            <div className="flex flex-col gap-1">
              <CardTitle>
                {candidate.profile.display_name ?? "Pelajar"}
              </CardTitle>
              {candidate.profile.education_level && (
                <p className="text-sm text-muted">
                  {labelFor(educationLevelLabels, candidate.profile.education_level)}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {candidate.profile.bio && (
              <p className="line-clamp-3 text-sm text-muted">
                {candidate.profile.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {candidate.reasons.map((reason) => (
                <Badge key={reason.label} tone="info">
                  {reason.label}
                </Badge>
              ))}
            </div>
            <div className="mt-1 flex justify-end">
              <Link
                href={`/discover/partners/${candidate.profile.id}`}
                className={buttonClasses("secondary", "sm", "no-underline")}
              >
                Lihat profil
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function KelompokTab() {
  const groups = await listVisibleGroups();
  const demo = isDemoModeEnabled();

  if (groups.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          title="Belum ada kelompok"
          description="Buat kelompok belajar pertama dan ajak partner belajar bergabung."
          action={
            <Link
              href="/groups/new"
              className={buttonClasses("primary", "md", "no-underline")}
            >
              Buat kelompok
            </Link>
          }
        />
        {demo ? <DemoGroupsSection /> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {group.description && (
                <p className="line-clamp-3 text-sm text-muted">
                  {group.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="neutral">
                  {labelFor(groupVisibilityLabels, group.visibility)}
                </Badge>
                <Badge tone="neutral">
                  {group.study_group_members?.[0]?.count ?? 0}/{group.max_members}{" "}
                  anggota
                </Badge>
              </div>
              <div className="mt-1 flex justify-end">
                <Link
                  href={`/groups/${group.id}`}
                  className={buttonClasses("secondary", "sm", "no-underline")}
                >
                  Lihat kelompok
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {demo ? <DemoGroupsSection /> : null}
    </div>
  );
}

async function MentorTab() {
  const mentors = await getVerifiedMentors();
  const demo = isDemoModeEnabled();

  if (mentors.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          title="Belum ada mentor terverifikasi"
          description="Mentor akan muncul setelah terverifikasi. Kamu bisa mulai dengan partner atau kelompok belajar sementara ini."
          action={
            <Link
              href="/discover?tab=kelompok"
              className={buttonClasses("primary", "md", "no-underline")}
            >
              Lihat kelompok belajar
            </Link>
          }
        />
        {demo ? <DemoMentorsSection /> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Card key={mentor.user_id}>
            <CardHeader className="flex flex-row items-start gap-3">
              <Avatar
                name={mentor.profiles?.display_name}
                src={mentor.profiles?.avatar_url}
              />
              <div className="flex flex-col gap-1">
                <CardTitle>
                  {mentor.profiles?.display_name ?? "Mentor"}
                </CardTitle>
                <Badge tone="success">Terverifikasi</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{mentor.headline}</p>
              <p className="mt-2 line-clamp-3 text-sm text-muted">
                {mentor.expertise_summary}
              </p>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/discover/mentors/${mentor.user_id}`}
                  className={buttonClasses("secondary", "sm", "no-underline")}
                >
                  Lihat detail
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {demo ? <DemoMentorsSection /> : null}
    </div>
  );
}
