"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { submitMentorFeedback } from "@/lib/mentoring/actions";
import { initialFormState } from "@/lib/forms/state";

const RATING_OPTIONS = [
  { value: "5", label: "5 — Sangat membantu" },
  { value: "4", label: "4 — Membantu" },
  { value: "3", label: "3 — Cukup" },
  { value: "2", label: "2 — Kurang" },
  { value: "1", label: "1 — Tidak membantu" },
];

export function MentorFeedbackForm({
  bookingId,
  defaultRating,
  defaultComment,
}: {
  bookingId: string;
  defaultRating?: number;
  defaultComment?: string;
}) {
  const [state, formAction] = useActionState(
    submitMentorFeedback,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />
      <input type="hidden" name="bookingId" value={bookingId} />

      <Field
        id="rating"
        label="Penilaian pengalaman"
        error={state.fieldErrors?.rating}
      >
        <Select
          id="rating"
          name="rating"
          defaultValue={defaultRating ? String(defaultRating) : "5"}
        >
          {RATING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        id="comment"
        label="Komentar (opsional)"
        error={state.fieldErrors?.comment}
      >
        <Textarea
          id="comment"
          name="comment"
          maxLength={1000}
          defaultValue={defaultComment}
          placeholder="Bagaimana sesi ini membantumu?"
        />
      </Field>

      <div>
        <SubmitButton pendingLabel="Mengirim…">
          {defaultRating ? "Perbarui feedback" : "Kirim feedback"}
        </SubmitButton>
      </div>
    </form>
  );
}
