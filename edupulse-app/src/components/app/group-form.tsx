"use client";

import Image from "next/image";
import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { createStudyGroup } from "@/lib/groups/actions";
import { FALLBACK_GROUP_COVER, GROUP_COVERS } from "@/lib/groups/covers";
import { initialFormState } from "@/lib/forms/state";
import type { TopicRow } from "@/lib/data/topics";
import type { GoalListItem } from "@/lib/data/goals";

export function GroupForm({
  topics,
  goals,
}: {
  topics: TopicRow[];
  goals: GoalListItem[];
}) {
  const [state, formAction] = useActionState(createStudyGroup, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <Field id="name" label="Nama kelompok" error={state.fieldErrors?.name}>
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          placeholder="Contoh: Belajar Python Bareng"
        />
      </Field>

      <Field
        id="description"
        label="Deskripsi (opsional)"
        error={state.fieldErrors?.description}
      >
        <Textarea
          id="description"
          name="description"
          maxLength={1000}
          placeholder="Tujuan dan aturan kelompok"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="topicId" label="Topik" error={state.fieldErrors?.topicId}>
          <Select id="topicId" name="topicId" defaultValue="">
            <option value="">Belum dipilih</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="learningGoalId"
          label="Terkait tujuan (opsional)"
          error={state.fieldErrors?.learningGoalId}
        >
          <Select id="learningGoalId" name="learningGoalId" defaultValue="">
            <option value="">Tidak terkait</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="maxMembers"
          label="Maksimal anggota"
          error={state.fieldErrors?.maxMembers}
        >
          <Input
            id="maxMembers"
            name="maxMembers"
            type="number"
            min={2}
            max={50}
            defaultValue={8}
            required
          />
        </Field>

        <Field
          id="visibility"
          label="Visibilitas"
          error={state.fieldErrors?.visibility}
        >
          <Select id="visibility" name="visibility" defaultValue="public">
            <option value="public">Publik</option>
            <option value="invite_only">Hanya undangan</option>
          </Select>
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Sampul kelompok</legend>
        <p className="text-xs text-muted">
          Pilih satu ilustrasi. Sampul hanya dapat dipilih dari daftar ini.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <CoverOption
            value=""
            label={FALLBACK_GROUP_COVER.label}
            src={FALLBACK_GROUP_COVER.src}
            alt={FALLBACK_GROUP_COVER.alt}
          />
          {GROUP_COVERS.map((cover) => (
            <CoverOption
              key={cover.key}
              value={cover.key as string}
              label={cover.label}
              src={cover.src}
              alt={cover.alt}
            />
          ))}
        </div>
        {state.fieldErrors?.coverImageKey ? (
          <p className="text-xs font-medium text-danger" role="alert">
            {state.fieldErrors.coverImageKey}
          </p>
        ) : null}
      </fieldset>

      <div>
        <SubmitButton pendingLabel="Membuat…">Buat kelompok</SubmitButton>
      </div>
    </form>
  );
}

function CoverOption({
  value,
  label,
  src,
  alt,
}: {
  value: string;
  label: string;
  src: string;
  alt: string;
}) {
  return (
    <label className="group flex cursor-pointer flex-col gap-2 rounded-[var(--radius-card)] border border-border p-2 text-xs transition-colors has-checked:border-primary">
      <input
        type="radio"
        name="coverImageKey"
        value={value}
        defaultChecked={value === ""}
        className="sr-only"
      />
      <span className="relative aspect-[5/3] w-full overflow-hidden rounded-md">
        <Image src={src} alt={alt} fill unoptimized className="object-cover" />
      </span>
      <span className="font-medium">{label}</span>
    </label>
  );
}
