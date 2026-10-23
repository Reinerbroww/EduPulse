"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createMentorSlot } from "@/lib/mentor/actions";
import { initialFormState } from "@/lib/forms/state";

export function MentorSlotForm() {
  const [state, formAction] = useActionState(createMentorSlot, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="startsAt"
          label="Mulai"
          error={state.fieldErrors?.startsAt}
        >
          <Input id="startsAt" name="startsAt" type="datetime-local" required />
        </Field>

        <Field id="endsAt" label="Selesai" error={state.fieldErrors?.endsAt}>
          <Input id="endsAt" name="endsAt" type="datetime-local" required />
        </Field>
      </div>

      <div>
        <SubmitButton pendingLabel="Menyimpan…">Tambah jadwal</SubmitButton>
      </div>
    </form>
  );
}
