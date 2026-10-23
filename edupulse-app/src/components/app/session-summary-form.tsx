"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { saveSessionSummary } from "@/lib/mentoring/actions";
import { initialFormState } from "@/lib/forms/state";

export function SessionSummaryForm({
  bookingId,
  defaultSummary,
  defaultNextSteps,
}: {
  bookingId: string;
  defaultSummary?: string;
  defaultNextSteps?: string;
}) {
  const [state, formAction] = useActionState(
    saveSessionSummary,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />
      <input type="hidden" name="bookingId" value={bookingId} />

      <Field
        id="summary"
        label="Apa yang kamu pelajari?"
        error={state.fieldErrors?.summary}
      >
        <Textarea
          id="summary"
          name="summary"
          required
          maxLength={4000}
          defaultValue={defaultSummary}
          placeholder="Poin penting dari sesi ini."
        />
      </Field>

      <Field
        id="nextSteps"
        label="Tugas / langkah berikutnya (opsional)"
        error={state.fieldErrors?.nextSteps}
      >
        <Textarea
          id="nextSteps"
          name="nextSteps"
          maxLength={2000}
          defaultValue={defaultNextSteps}
          placeholder="Apa yang akan kamu lakukan selanjutnya?"
        />
      </Field>

      <div>
        <SubmitButton pendingLabel="Menyimpan…">
          {defaultSummary ? "Perbarui ringkasan" : "Simpan ringkasan"}
        </SubmitButton>
      </div>
    </form>
  );
}
