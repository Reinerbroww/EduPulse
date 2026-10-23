"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms/state";
import { submitMentorVerification } from "@/lib/mentor/actions";

// Submitting is gated on having a CV on file: the button is disabled without one
// and the server action (plus the RPC from migration 012) rejects the request a
// second time, so the client state can never be the only guard.
export function MentorVerificationSubmit({
  mentorId,
  hasCv,
}: {
  mentorId: string;
  hasCv: boolean;
}) {
  const [state, formAction] = useActionState(
    submitMentorVerification,
    initialFormState,
  );

  return (
    <div className="flex flex-col gap-3">
      <AuthFormMessage state={state} />
      {!hasCv && (
        <Alert tone="warning">
          Unggah CV PDF dulu sebelum mengajukan verifikasi.
        </Alert>
      )}
      <form action={formAction}>
        <input type="hidden" name="mentorId" value={mentorId} />
        {hasCv ? (
          <SubmitButton size="sm" pendingLabel="Mengirim…">
            Ajukan verifikasi
          </SubmitButton>
        ) : (
          <Button type="button" size="sm" disabled>
            Ajukan verifikasi
          </Button>
        )}
      </form>
    </div>
  );
}
