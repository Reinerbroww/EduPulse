"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { Alert } from "@/components/ui/alert";
import { Button, buttonClasses } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms/state";
import { reviewVerification } from "@/lib/moderation/actions";

// Approve/reject a pending mentor verification. Approval is disabled without a
// CV because the RPC (migration 012) refuses it — showing the disabled state is
// only the courtesy half of that rule.
export function ModeratorVerificationActions({
  mentorId,
  hasCv,
}: {
  mentorId: string;
  hasCv: boolean;
}) {
  const [state, formAction] = useActionState(
    reviewVerification,
    initialFormState,
  );

  return (
    <div className="flex flex-col gap-3">
      <AuthFormMessage state={state} />
      {!hasCv && (
        <Alert tone="warning">
          Dokumen CV tidak ditemukan untuk pengajuan ini, jadi belum bisa
          disetujui.
        </Alert>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <form action={formAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="mentorId" value={mentorId} />
          <Button
            type="submit"
            name="decision"
            value="verified"
            size="sm"
            disabled={!hasCv}
          >
            Setujui
          </Button>
          <Button
            type="submit"
            name="decision"
            value="rejected"
            size="sm"
            variant="secondary"
          >
            Tolak
          </Button>
        </form>
        {hasCv && (
          <a
            href={`/cv/${mentorId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("secondary", "sm", "no-underline")}
          >
            Lihat CV
          </a>
        )}
      </div>
    </div>
  );
}
