"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { createLearningGoal, updateLearningGoal } from "@/lib/goals/actions";
import { initialFormState } from "@/lib/forms/state";
import { supportModeLabels } from "@/lib/status";
import type { TopicRow } from "@/lib/data/topics";
import type { GoalListItem } from "@/lib/data/goals";

// One component drives both `/goals/new` (create) and `/goals/[goalId]/edit`.
// Passing `goal` switches the action and pre-fills every control, so the two
// dedicated routes share validation, layout and messaging.
export function GoalForm({
  topics,
  goal,
}: {
  topics: TopicRow[];
  goal?: GoalListItem;
}) {
  const [state, formAction] = useActionState(
    goal ? updateLearningGoal : createLearningGoal,
    initialFormState,
  );

  const selectedSupportModes = new Set(
    goal?.support_modes ?? ["partner", "group", "mentor"],
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      {goal ? <input type="hidden" name="goalId" value={goal.id} /> : null}

      <Field id="title" label="Judul tujuan" error={state.fieldErrors?.title}>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={goal?.title}
          placeholder="Contoh: Memahami dasar Python"
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
          defaultValue={goal?.description ?? ""}
          placeholder="Apa yang ingin kamu capai?"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="topicId" label="Topik" error={state.fieldErrors?.topicId}>
          <Select id="topicId" name="topicId" defaultValue={goal?.topic_id ?? ""}>
            <option value="">Belum dipilih</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="targetDate"
          label="Target tanggal (opsional)"
          error={state.fieldErrors?.targetDate}
        >
          <Input
            id="targetDate"
            name="targetDate"
            type="date"
            defaultValue={goal?.target_date ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">
            Dukungan yang dicari
          </legend>
          <p className="text-xs text-muted">Boleh pilih lebih dari satu.</p>
          <div className="grid gap-2">
            {(["partner", "group", "mentor"] as const).map((mode) => (
              <Label
                key={mode}
                htmlFor={`supportMode-${mode}`}
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm font-normal"
              >
                <input
                  id={`supportMode-${mode}`}
                  type="checkbox"
                  name="supportModes"
                  value={mode}
                  defaultChecked={selectedSupportModes.has(mode)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {supportModeLabels[mode]}
              </Label>
            ))}
          </div>
          {state.fieldErrors?.supportModes ? (
            <p className="text-xs text-danger">
              {state.fieldErrors.supportModes}
            </p>
          ) : null}
        </fieldset>

        <Field
          id="visibility"
          label="Visibilitas"
          hint="Privat berarti tidak dipakai untuk pencocokan."
          error={state.fieldErrors?.visibility}
        >
          <Select
            id="visibility"
            name="visibility"
            defaultValue={goal?.visibility ?? "matchable"}
          >
            <option value="matchable">Dapat dicocokkan</option>
            <option value="private">Privat</option>
          </Select>
        </Field>
      </div>

      <div>
        <SubmitButton pendingLabel="Menyimpan…">
          {goal ? "Simpan perubahan" : "Simpan tujuan"}
        </SubmitButton>
      </div>
    </form>
  );
}
