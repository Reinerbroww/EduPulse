import Link from "next/link";

import { DemoBadge } from "@/components/app/demo-groups";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEMO_LABEL,
  DEMO_SESSIONS,
  DEMO_SESSION_DISCLAIMER,
} from "@/lib/demo/fixtures";

// Shows the structure of a study session (agenda + checklist) when there is no
// real session to display. Rendered as read-only content — no checkboxes are
// interactive and nothing is written to the database.
export function DemoSessionsSection({ groupId }: { groupId?: string }) {
  const session = DEMO_SESSIONS[0];
  const createHref = groupId
    ? `/groups/${groupId}/sessions/new`
    : "/groups";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Sesi contoh</h2>
        <DemoBadge />
      </div>

      <Alert tone="warning" role="alert">
        <strong className="font-semibold">
          {DEMO_LABEL} — bukan data nyata.
        </strong>{" "}
        {DEMO_SESSION_DISCLAIMER}
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <CardTitle>Agenda</CardTitle>
            <DemoBadge />
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="font-medium">{session.title}</p>
            <p className="text-xs text-muted">{session.scheduleLabel} (contoh)</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-muted">
              {session.agenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <CardTitle>Daftar periksa</CardTitle>
            <DemoBadge />
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {session.checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={
                    item.done
                      ? "flex size-4 items-center justify-center rounded border border-primary bg-primary text-[10px] text-primary-foreground"
                      : "size-4 rounded border border-border-strong"
                  }
                >
                  {item.done ? "✓" : ""}
                </span>
                <span className={item.done ? "text-muted line-through" : ""}>
                  {item.label}
                </span>
              </div>
            ))}
            <p className="mt-1 text-xs text-muted">
              Item contoh, tidak bisa dicentang.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Link
          href={createHref}
          className={buttonClasses("primary", "md", "no-underline")}
        >
          Buat sesi sungguhan
        </Link>
      </div>
    </section>
  );
}
