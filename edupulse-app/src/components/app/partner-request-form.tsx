"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { sendPartnerRequest } from "@/lib/partners/actions";
import { initialFormState } from "@/lib/forms/state";

export function PartnerRequestForm({
  recipientId,
  goals,
}: {
  recipientId: string;
  goals: { id: string; title: string }[];
}) {
  const [state, formAction] = useActionState(
    sendPartnerRequest,
    initialFormState,
  );

  const sent = state.status === "success";

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />
      <input type="hidden" name="recipientId" value={recipientId} />

      {!sent && (
        <>
          {goals.length > 0 && (
            <Field
              id="learningGoalId"
              label="Kaitkan dengan tujuan (opsional)"
              hint="Permintaan akan mereferensikan tujuan belajar ini."
            >
              <Select
                id="learningGoalId"
                name="learningGoalId"
                defaultValue=""
              >
                <option value="">Tidak dikaitkan</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field
            id="message"
            label="Pesan (opsional)"
            error={state.fieldErrors?.message}
          >
            <Textarea
              id="message"
              name="message"
              maxLength={500}
              placeholder="Ceritakan singkat apa yang ingin kamu pelajari bersama."
            />
          </Field>

          <div>
            <SubmitButton pendingLabel="Mengirim…">
              Kirim permintaan belajar
            </SubmitButton>
          </div>
        </>
      )}
    </form>
  );
}
