"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { createStudySession } from "@/lib/sessions/actions";
import { initialFormState } from "@/lib/forms/state";

export function SessionForm({ groupId }: { groupId: string }) {
  const action = createStudySession.bind(null, groupId);
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <Field id="title" label="Judul sesi" error={state.fieldErrors?.title}>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="Contoh: Latihan soal bab 3"
        />
      </Field>

      <Field
        id="objectives"
        label="Tujuan sesi (opsional)"
        error={state.fieldErrors?.objectives}
      >
        <Textarea
          id="objectives"
          name="objectives"
          maxLength={1000}
          placeholder="Apa yang ingin dicapai"
        />
      </Field>

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

      <Field
        id="externalMeetingUrl"
        label="Tautan pertemuan (opsional)"
        error={state.fieldErrors?.externalMeetingUrl}
      >
        <Input
          id="externalMeetingUrl"
          name="externalMeetingUrl"
          type="url"
          placeholder="https://..."
        />
      </Field>

      <div>
        <SubmitButton pendingLabel="Membuat…">Buat sesi</SubmitButton>
      </div>
    </form>
  );
}
