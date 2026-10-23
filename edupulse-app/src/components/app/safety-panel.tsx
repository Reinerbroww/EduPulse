"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { blockUser, unblockUser, submitReport } from "@/lib/safety/actions";
import { initialFormState } from "@/lib/forms/state";
import { reportReasonLabels } from "@/lib/status";

// Trust & safety controls (STEP 6, item 13): a user can always block or report
// another user from any surface where they appear. Blocking hides them from
// matching; reporting is never silently discarded.
export function SafetyPanel({
  userId,
  displayName,
  isBlocked,
  studyGroupId,
  studySessionId,
  mentorBookingId,
}: {
  userId: string;
  displayName: string;
  isBlocked: boolean;
  studyGroupId?: string;
  studySessionId?: string;
  mentorBookingId?: string;
}) {
  const [state, formAction] = useActionState(submitReport, initialFormState);

  return (
    <div className="flex flex-col gap-4">
      <form action={isBlocked ? unblockUser : blockUser}>
        <input type="hidden" name="blockedUserId" value={userId} />
        <SubmitButton
          variant={isBlocked ? "secondary" : "danger"}
          pendingLabel="Memproses…"
        >
          {isBlocked ? "Buka blokir pengguna" : "Blokir pengguna"}
        </SubmitButton>
      </form>

      {isBlocked && (
        <p className="text-xs text-muted">
          Pengguna yang diblokir tidak akan muncul di pencarian partner.
        </p>
      )}

      <details className="rounded-[var(--radius-card)] border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium text-ink">
          Laporkan {displayName}
        </summary>
        <form action={formAction} className="mt-4 flex flex-col gap-4" noValidate>
          <AuthFormMessage state={state} />
          <input type="hidden" name="reportedUserId" value={userId} />
          {studyGroupId && (
            <input type="hidden" name="studyGroupId" value={studyGroupId} />
          )}
          {studySessionId && (
            <input type="hidden" name="studySessionId" value={studySessionId} />
          )}
          {mentorBookingId && (
            <input
              type="hidden"
              name="mentorBookingId"
              value={mentorBookingId}
            />
          )}

          <Field
            id="reasonCode"
            label="Alasan laporan"
            error={state.fieldErrors?.reasonCode}
          >
            <Select id="reasonCode" name="reasonCode" defaultValue="unsafe_behavior">
              {Object.entries(reportReasonLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id="details"
            label="Detail (opsional)"
            error={state.fieldErrors?.details}
          >
            <Textarea
              id="details"
              name="details"
              maxLength={1000}
              placeholder="Jelaskan apa yang terjadi."
            />
          </Field>

          <div>
            <SubmitButton variant="danger" pendingLabel="Mengirim…">
              Kirim laporan
            </SubmitButton>
          </div>
        </form>
      </details>
    </div>
  );
}
