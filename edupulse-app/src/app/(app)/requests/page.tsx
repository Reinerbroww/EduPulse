import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { SubmitButton } from "@/components/auth/submit-button";
import { UsersIcon } from "@/components/brand/icons";
import { Avatar } from "@/components/ui/avatar";
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
import { listMyPartnerRequests } from "@/lib/data/partners";
import { respondPartnerRequest } from "@/lib/partners/actions";
import {
  partnerRequestStatusLabels,
  partnerRequestStatusTones,
} from "@/lib/status";
import type { PartnerRequestListItem } from "@/lib/data/partners";

export const metadata: Metadata = { title: "Permintaan Belajar" };

function RequestCard({
  request,
  direction,
}: {
  request: PartnerRequestListItem;
  direction: "incoming" | "outgoing";
}) {
  const name = request.counterpart?.display_name ?? "Pengguna";
  const goalHref = request.counterpart
    ? `/discover/partners/${request.counterpart.id}`
    : null;

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={name} size="sm" />
          <span className="text-sm font-medium text-ink">{name}</span>
        </div>
        <StatusBadge
          value={request.status}
          labels={partnerRequestStatusLabels}
          tones={partnerRequestStatusTones}
        />
      </div>

      {request.message && (
        <p className="text-sm text-muted">{request.message}</p>
      )}

      {request.learning_goal_id && (
        <p className="text-xs text-muted">
          Terkait sebuah tujuan belajar.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {direction === "incoming" && request.status === "pending" && (
          <>
            <form action={respondPartnerRequest}>
              <input type="hidden" name="requestId" value={request.id} />
              <input type="hidden" name="action" value="accept" />
              <SubmitButton size="sm" pendingLabel="Memproses…">
                Terima
              </SubmitButton>
            </form>
            <form action={respondPartnerRequest}>
              <input type="hidden" name="requestId" value={request.id} />
              <input type="hidden" name="action" value="reject" />
              <SubmitButton
                size="sm"
                variant="secondary"
                pendingLabel="Memproses…"
              >
                Tolak
              </SubmitButton>
            </form>
          </>
        )}

        {direction === "outgoing" && request.status === "pending" && (
          <form action={respondPartnerRequest}>
            <input type="hidden" name="requestId" value={request.id} />
            <input type="hidden" name="action" value="cancel" />
            <SubmitButton
              size="sm"
              variant="secondary"
              pendingLabel="Memproses…"
            >
              Batalkan
            </SubmitButton>
          </form>
        )}

        {goalHref && (
          <Link
            href={goalHref}
            className="inline-flex h-9 items-center px-3 text-sm font-medium text-primary no-underline"
          >
            Lihat profil
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function RequestsPage() {
  await requireUser("/requests");
  const { incoming, outgoing } = await listMyPartnerRequests();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Permintaan Belajar"
        description="Kelola permintaan partner belajar yang masuk dan yang kamu kirim."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Masuk</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {incoming.length === 0 ? (
              <EmptyState
                icon={<UsersIcon className="size-5" />}
                title="Belum ada permintaan masuk"
                description="Permintaan dari calon partner belajarmu akan muncul di sini. Lengkapi profilmu agar mudah ditemukan."
                action={
                  <Link
                    href="/discover?tab=partner"
                    className={buttonClasses("secondary", "sm", "no-underline")}
                  >
                    Jelajahi partner belajar
                  </Link>
                }
              />
            ) : (
              incoming.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  direction="incoming"
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terkirim</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {outgoing.length === 0 ? (
              <EmptyState
                icon={<UsersIcon className="size-5" />}
                title="Belum ada permintaan terkirim"
                description="Jelajahi partner belajar dan kirim permintaan pertamamu."
                action={
                  <Link
                    href="/discover?tab=partner"
                    className={buttonClasses("primary", "sm", "no-underline")}
                  >
                    Cari partner belajar
                  </Link>
                }
              />
            ) : (
              outgoing.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  direction="outgoing"
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
