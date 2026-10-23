"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { transitionBooking } from "@/lib/bookings/actions";
import { initialFormState } from "@/lib/forms/state";

// Booking lifecycle controls (STEP 6, group 5): the mentor confirms or declines
// a pending request and marks a confirmed session complete; both parties can
// cancel. Status changes are validated server-side (RPC transition_booking_status)
// which also returns the reserved availability slot to the mentor on cancel.
const TERMINAL_STATUSES = new Set([
  "declined",
  "cancelled_by_learner",
  "cancelled_by_mentor",
  "completed",
  "no_show",
]);

function ReasonForm({
  bookingId,
  action,
  summary,
  submitLabel,
  placeholder,
  formAction,
}: {
  bookingId: string;
  action: string;
  summary: string;
  submitLabel: string;
  placeholder: string;
  formAction: (formData: FormData) => void;
}) {
  return (
    <details className="rounded-[var(--radius-card)] border border-border p-3">
      <summary className="cursor-pointer text-sm font-medium text-ink">
        {summary}
      </summary>
      <form action={formAction} className="mt-3 flex flex-col gap-3" noValidate>
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="action" value={action} />
        <Field id={`reason-${action}`} label="Alasan (opsional)">
          <Textarea
            id={`reason-${action}`}
            name="reason"
            maxLength={500}
            placeholder={placeholder}
          />
        </Field>
        <div>
          <SubmitButton variant="danger" size="sm" pendingLabel="Memproses…">
            {submitLabel}
          </SubmitButton>
        </div>
      </form>
    </details>
  );
}

export function BookingActions({
  bookingId,
  role,
  status,
}: {
  bookingId: string;
  role: "learner" | "mentor";
  status: string;
}) {
  const [state, formAction] = useActionState(
    transitionBooking,
    initialFormState,
  );

  if (TERMINAL_STATUSES.has(status)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kelola sesi</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <AuthFormMessage state={state} />

        {role === "mentor" && status === "pending" && (
          <>
            <form action={formAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="action" value="confirm" />
              <SubmitButton pendingLabel="Memproses…">
                Konfirmasi sesi
              </SubmitButton>
            </form>
            <ReasonForm
              bookingId={bookingId}
              action="decline"
              summary="Tolak permintaan"
              submitLabel="Tolak sesi"
              placeholder="Misalnya jadwal bentrok."
              formAction={formAction}
            />
          </>
        )}

        {role === "mentor" && status === "confirmed" && (
          <>
            <form action={formAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="action" value="complete" />
              <SubmitButton pendingLabel="Memproses…">
                Tandai sesi selesai
              </SubmitButton>
            </form>
            <ReasonForm
              bookingId={bookingId}
              action="cancel_by_mentor"
              summary="Batalkan sesi"
              submitLabel="Batalkan sesi"
              placeholder="Alasan pembatalan."
              formAction={formAction}
            />
          </>
        )}

        {role === "learner" && (
          <ReasonForm
            bookingId={bookingId}
            action="cancel_by_learner"
            summary={
              status === "pending" ? "Batalkan permintaan" : "Batalkan sesi"
            }
            submitLabel="Batalkan"
            placeholder="Alasan pembatalan."
            formAction={formAction}
          />
        )}
      </CardContent>
    </Card>
  );
}
