import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/app/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Shared shell for every dedicated create/edit route. Keeping title, purpose and
// the back link in one component means list/summary pages no longer need to
// embed forms, and navigation back to the origin stays consistent.
export function FormPage({
  title,
  description,
  backHref,
  backLabel = "Kembali",
  children,
}: {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="pt-5">{children}</CardContent>
      </Card>
      <Link
        href={backHref}
        className={buttonClasses("ghost", "sm", "no-underline self-start")}
      >
        ← {backLabel}
      </Link>
    </div>
  );
}
