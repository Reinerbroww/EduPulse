"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { upsertMentorProfile } from "@/lib/mentor/actions";
import { initialFormState } from "@/lib/forms/state";
import type { MentorProfileSelf } from "@/lib/data/mentor-self";

export function MentorProfileForm({
  profile,
}: {
  profile: MentorProfileSelf | null;
}) {
  const [state, formAction] = useActionState(
    upsertMentorProfile,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <Field
        id="headline"
        label="Judul singkat"
        error={state.fieldErrors?.headline}
      >
        <Input
          id="headline"
          name="headline"
          required
          maxLength={120}
          defaultValue={profile?.headline}
          placeholder="Contoh: Mentor Matematika Dasar"
        />
      </Field>

      <Field
        id="expertiseSummary"
        label="Ringkasan keahlian"
        error={state.fieldErrors?.expertiseSummary}
      >
        <Textarea
          id="expertiseSummary"
          name="expertiseSummary"
          required
          maxLength={2000}
          defaultValue={profile?.expertise_summary}
          placeholder="Jelaskan bidang dan pengalaman yang kamu bantu."
        />
      </Field>

      <Field
        id="experienceYears"
        label="Pengalaman (tahun, opsional)"
        error={state.fieldErrors?.experienceYears}
      >
        <Input
          id="experienceYears"
          name="experienceYears"
          type="number"
          min={0}
          max={60}
          defaultValue={profile?.experience_years ?? undefined}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAcceptingBookings"
          defaultChecked={profile?.is_accepting_bookings ?? false}
        />
        Menerima pengajuan sesi
      </label>

      <div>
        <SubmitButton pendingLabel="Menyimpan…">
          {profile ? "Perbarui profil mentor" : "Buat profil mentor"}
        </SubmitButton>
      </div>
    </form>
  );
}
