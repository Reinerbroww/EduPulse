import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_GROUPS, DEMO_LABEL } from "@/lib/demo/fixtures";
import { getGroupCover } from "@/lib/groups/covers";

export function DemoBadge() {
  return (
    <Badge tone="accent" className="font-semibold uppercase tracking-wide">
      {DEMO_LABEL}
    </Badge>
  );
}

export function DemoGroupsSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Kelompok contoh</h2>
        <DemoBadge />
      </div>
      <p className="text-sm text-muted">
        Contoh isi kelompok. Data ini hanya tampilan dan tidak tersimpan di
        database.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {DEMO_GROUPS.map((group) => {
          const cover = getGroupCover(group.coverKey);
          return (
            <Card key={group.slug} className="overflow-hidden">
              <span className="relative block h-28 w-full">
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </span>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>{group.name}</CardTitle>
                <DemoBadge />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted">{group.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{group.topic}</Badge>
                  <Badge tone="neutral">
                    {group.memberCount}/{group.maxMembers} anggota (contoh)
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Agenda contoh
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                    {group.agenda.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-muted">
                  Kelompok contoh tidak bisa dibuka atau dimasuki. Buat
                  kelompok sendiri untuk mulai belajar sungguhan.
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <Link
          href="/groups"
          className={buttonClasses("primary", "md", "no-underline")}
        >
          Buat kelompok nyata
        </Link>
      </div>
    </section>
  );
}
