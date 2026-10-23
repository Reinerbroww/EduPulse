import Link from "next/link";

import { DemoBadge } from "@/components/app/demo-groups";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_MENTORS,
  DEMO_MENTOR_DISCLAIMER,
  DEMO_LABEL,
} from "@/lib/demo/fixtures";

export function DemoMentorsSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Mentor contoh</h2>
        <DemoBadge />
      </div>

      <Alert tone="warning" role="alert">
        <strong className="font-semibold">
          {DEMO_LABEL} — bukan data nyata.
        </strong>{" "}
        {DEMO_MENTOR_DISCLAIMER}
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_MENTORS.map((mentor) => (
          <Card key={mentor.slug}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <CardTitle>{mentor.name}</CardTitle>
              <DemoBadge />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm font-medium">{mentor.expertise}</p>
              <p className="text-sm text-muted">{mentor.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {mentor.topics.map((topic) => (
                  <Badge key={topic} tone="info">
                    {topic}
                  </Badge>
                ))}
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
                <dt>Pengalaman</dt>
                <dd className="text-right font-medium text-ink">
                  {mentor.experienceYears} tahun (contoh)
                </dd>
                <dt>Bentuk layanan</dt>
                <dd className="text-right font-medium text-ink">
                  {mentor.service.mode}
                </dd>
                <dt>Durasi</dt>
                <dd className="text-right font-medium text-ink">
                  {mentor.service.durationMinutes} menit
                </dd>
                <dt>Biaya</dt>
                <dd className="text-right font-medium text-ink">
                  {mentor.service.priceLabel}
                </dd>
                <dt>Status verifikasi</dt>
                <dd className="text-right font-medium text-ink">
                  Belum diajukan (contoh)
                </dd>
              </dl>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span
                  className={buttonClasses("secondary", "sm", "cursor-not-allowed opacity-60")}
                  aria-disabled="true"
                >
                  Ajukan sesi
                </span>
                <span className="text-xs text-muted">
                  Tidak menerima pemesanan
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Link
          href="/mentor"
          className={buttonClasses("primary", "md", "no-underline")}
        >
          Buat profil mentor sungguhan
        </Link>
      </div>
    </section>
  );
}
