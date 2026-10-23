"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { TimezoneField } from "@/components/app/timezone-field";
import { Field } from "@/components/ui/field";
import { Input, Label, Select } from "@/components/ui/input";
import { completeOnboarding } from "@/lib/onboarding/actions";
import { initialFormState } from "@/lib/forms/state";
import {
  educationLevelLabels,
  skillLevelLabels,
} from "@/lib/status";
import type { TopicRow } from "@/lib/data/topics";

export function OnboardingForm({
  topics,
  defaultDisplayName,
  defaultEducationLevel,
  defaultAgeBand,
  defaultVisibility,
  defaultTimezone,
  defaultSkillLevel,
  selectedTopicIds,
}: {
  topics: TopicRow[];
  defaultDisplayName: string;
  defaultEducationLevel: string | null;
  defaultAgeBand: string;
  defaultVisibility: string;
  defaultTimezone: string;
  defaultSkillLevel: string;
  selectedTopicIds: string[];
}) {
  const [state, formAction] = useActionState(
    completeOnboarding,
    initialFormState,
  );

  const selected = new Set(selectedTopicIds);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <AuthFormMessage state={state} />

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Profil belajar</h2>
        <Field
          id="displayName"
          label="Nama tampilan"
          error={state.fieldErrors?.displayName}
        >
          <Input
            id="displayName"
            name="displayName"
            defaultValue={defaultDisplayName}
            required
            maxLength={60}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="educationLevel"
            label="Jenjang pendidikan"
            error={state.fieldErrors?.educationLevel}
          >
            <Select
              id="educationLevel"
              name="educationLevel"
              defaultValue={defaultEducationLevel ?? "school"}
            >
              {Object.entries(educationLevelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id="skillLevel"
            label="Tingkat pemahaman rata-rata"
            error={state.fieldErrors?.skillLevel}
          >
            <Select
              id="skillLevel"
              name="skillLevel"
              defaultValue={defaultSkillLevel}
            >
              {Object.entries(skillLevelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Keselamatan &amp; privasi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="ageBand"
            label="Kelompok usia"
            hint="Remaja di bawah 18 tahun belum dapat menggunakan fitur mentoring."
            error={state.fieldErrors?.ageBand}
          >
            <Select id="ageBand" name="ageBand" defaultValue={defaultAgeBand}>
              <option value="not_set">Belum diisi</option>
              <option value="under_18">Di bawah 18 tahun</option>
              <option value="18_or_over">18 tahun atau lebih</option>
            </Select>
          </Field>

          <Field
            id="profileVisibility"
            label="Visibilitas profil"
            hint="Profil privat tidak muncul di pencarian."
            error={state.fieldErrors?.profileVisibility}
          >
            <Select
              id="profileVisibility"
              name="profileVisibility"
              defaultValue={defaultVisibility}
            >
              <option value="discoverable">Dapat ditemukan</option>
              <option value="private">Privat</option>
            </Select>
          </Field>
        </div>
        <TimezoneField defaultValue={defaultTimezone} />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Topik minat</h2>
          <p className="text-sm text-muted">
            Pilih topik yang ingin kamu pelajari. Kamu bisa mengubahnya nanti.
          </p>
        </div>

        {topics.length === 0 ? (
          <p className="text-sm text-muted">
            Katalog topik belum tersedia. Jalankan migrasi seed topik terlebih
            dahulu.
          </p>
        ) : (
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Topik minat</legend>
            {topics.map((topic) => (
              <Label
                key={topic.id}
                htmlFor={`topic-${topic.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm font-normal">
                <input
                  id={`topic-${topic.id}`}
                  type="checkbox"
                  name="topicIds"
                  value={topic.id}
                  defaultChecked={selected.has(topic.id)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {topic.name}
              </Label>
            ))}
          </fieldset>
        )}
      </section>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Menyimpan…">Simpan &amp; lanjut</SubmitButton>
      </div>
    </form>
  );
}
