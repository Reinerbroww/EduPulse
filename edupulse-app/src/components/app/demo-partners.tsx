import Link from "next/link";

import { DemoBadge } from "@/components/app/demo-groups";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_LABEL,
  DEMO_PARTNERS,
  DEMO_PARTNER_DISCLAIMER,
} from "@/lib/demo/fixtures";

export function DemoPartnersSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Partner contoh</h2>
        <DemoBadge />
      </div>

      <Alert tone="warning" role="alert">
        <strong className="font-semibold">
          {DEMO_LABEL} — bukan data nyata.
        </strong>{" "}
        {DEMO_PARTNER_DISCLAIMER}
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_PARTNERS.map((partner) => (
          <Card key={partner.slug}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <Avatar name={partner.name} />
                <div>
                  <CardTitle>{partner.name}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted">
                    {partner.educationLevel}
                  </p>
                </div>
              </div>
              <DemoBadge />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="line-clamp-3 text-sm text-muted">{partner.bio}</p>
              <div className="flex flex-wrap gap-1.5">
                {partner.topics.map((topic) => (
                  <Badge key={topic} tone="info">
                    {topic}
                  </Badge>
                ))}
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted">Tujuan belajar</dt>
                <dd className="font-medium text-ink">{partner.goal}</dd>
                <dt className="text-muted">Alasan cocok</dt>
                <dd className="font-medium text-ink">{partner.matchReason}</dd>
                <dt className="text-muted">Waktu luang</dt>
                <dd className="font-medium text-ink">{partner.availability}</dd>
              </dl>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span
                  className={buttonClasses(
                    "secondary",
                    "sm",
                    "cursor-not-allowed opacity-60",
                  )}
                  aria-disabled="true"
                >
                  Kirim permintaan
                </span>
                <span className="text-xs text-muted">
                  Tidak mengirim permintaan
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Link
          href="/onboarding"
          className={buttonClasses("primary", "md", "no-underline")}
        >
          Lengkapi profil belajarku
        </Link>
      </div>
    </section>
  );
}
