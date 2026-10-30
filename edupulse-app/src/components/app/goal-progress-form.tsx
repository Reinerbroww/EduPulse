"use client";

import { useActionState, useState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { addGoalProgressUpdate } from "@/lib/mentoring/actions";
import { initialFormState } from "@/lib/forms/state";

const QUICK_STEPS = [5, 10, 25] as const;

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
  const [progress, setProgress] = useState(defaultPercent);

  const clampProgress = (value: number) =>
    Math.min(100, Math.max(0, Math.round(value)));

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
        hint="Geser slider atau pakai tombol cepat untuk memperbarui progres."
        error={state.fieldErrors?.progressPercent}
      >
        <div className="flex items-center gap-3">
          <input
            id="progressPercent"
            type="range"
            min={0}
            max={100}
            step={1}
            value={progress}
            onChange={(event) =>
              setProgress(clampProgress(Number(event.target.value)))
            }
            className="h-2 w-full cursor-pointer accent-[var(--color-primary)]"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          />
          <span className="w-14 shrink-0 text-right text-sm font-semibold text-ink">
            {progress}%
          </span>
        </div>
        <input type="hidden" name="progressPercent" value={progress} />
      </Field>

      <div className="flex flex-wrap gap-2">
        {QUICK_STEPS.map((step) => (
          <Button
            key={step}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setProgress((value) => clampProgress(value + step))}
          >
            +{step}%
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setProgress((value) => clampProgress(value - 5))}
        >
          -5%
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setProgress(0)}
        >
          Reset
        </Button>
      </div>

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
