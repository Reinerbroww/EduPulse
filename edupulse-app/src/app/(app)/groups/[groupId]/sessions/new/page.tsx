import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { SessionForm } from "@/components/app/session-form";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";
import { getGroupDetail } from "@/lib/data/groups";

export const metadata: Metadata = { title: "Sesi baru" };

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  await requireUser(`/groups/${groupId}/sessions/new`);

  const detail = await getGroupDetail(groupId);
  if (!detail) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="Buat sesi belajar"
        description={`Kelompok: ${detail.group.name}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Detail sesi</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionForm groupId={groupId} />
        </CardContent>
      </Card>
      <Link
        href={`/groups/${groupId}`}
        className={buttonClasses("ghost", "sm", "no-underline self-start")}
      >
        ← Kembali ke kelompok
      </Link>
    </div>
  );
}
