"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { addGoalProgressUpdate } from "@/lib/mentoring/actions";
import { initialFormState } from "@/lib/forms/state";

export function GoalProgressForm({
  goalId,
  defaultPercent,
  sourceSessionId,
  sourceBookingId,
}: {
  goalId: string;
  defaultPercent: number;
  sourceSessionId?: string;
  sourceBookingId?: string;
}) {
  const [state, formAction] = useActionState(
    addGoalProgressUpdate,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />
      <input type="hidden" name="learningGoalId" value={goalId} />
      {sourceSessionId && (
        <input
          type="hidden"
          name="sourceStudySessionId"
          value={sourceSessionId}
        />
      )}
      {sourceBookingId && (
        <input
          type="hidden"
          name="sourceMentorBookingId"
          value={sourceBookingId}
        />
      )}

      <Field
        id="progressPercent"
        label="Progres saat ini (%)"
        hint="Perkiraan seberapa jauh kamu merasa sudah berkembang menuju target."
        error={state.fieldErrors?.progressPercent}
      >
        <Input
          id="progressPercent"
          name="progressPercent"
          type="number"
          min={0}
          max={100}
          defaultValue={defaultPercent}
          required
        />
      </Field>

      <Field
        id="updateText"
        label="Catatan perkembangan (opsional)"
        error={state.fieldErrors?.updateText}
      >
        <Textarea
          id="updateText"
          name="updateText"
          maxLength={2000}
          placeholder="Apa yang sudah kamu capai atau pelajari belakangan ini?"
        />
      </Field>

      <Field
        id="nextStep"
        label="Langkah berikutnya (opsional)"
        error={state.fieldErrors?.nextStep}
      >
        <Input
          id="nextStep"
          name="nextStep"
          maxLength={1000}
          placeholder="Target berikutnya."
        />
      </Field>

      <div>
        <SubmitButton pendingLabel="Menyimpan…">
          Perbarui progres
        </SubmitButton>
      </div>
    </form>
  );
}
