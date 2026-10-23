"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import {
  addAvailability,
  deleteAvailability,
  toggleAvailability,
} from "@/lib/settings/actions";
import { initialFormState } from "@/lib/forms/state";
import { dayOfWeekLabels } from "@/lib/status";
import type { AvailabilityRow } from "@/lib/data/settings";

function hhmm(value: string) {
  return value.slice(0, 5);
}

export function AvailabilityManager({ rows }: { rows: AvailabilityRow[] }) {
  const [state, formAction] = useActionState(addAvailability, initialFormState);

  return (
    <div className="flex flex-col gap-4">
      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          Belum ada jadwal. Tambahkan waktu luangmu agar partner belajar yang
          cocok mudah ditemukan.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border p-3"
            >
              <span className="text-sm">
                <span className="font-medium text-ink">
                  {dayOfWeekLabels[String(row.day_of_week)] ?? row.day_of_week}
                </span>{" "}
                · {hhmm(row.start_time)}–{hhmm(row.end_time)}
                {!row.is_active && (
                  <span className="ml-2 text-xs text-muted">(nonaktif)</span>
                )}
              </span>
              <div className="flex gap-2">
                <form action={toggleAvailability}>
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    type="hidden"
                    name="next"
                    value={String(!row.is_active)}
                  />
                  <SubmitButton
                    size="sm"
                    variant="secondary"
                    pendingLabel="Memproses…"
                  >
                    {row.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </SubmitButton>
                </form>
                <form action={deleteAvailability}>
                  <input type="hidden" name="id" value={row.id} />
                  <SubmitButton size="sm" variant="danger" pendingLabel="Menghapus…">
                    Hapus
                  </SubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="flex flex-col gap-3 border-t border-border pt-4"
        noValidate
      >
        <AuthFormMessage state={state} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            id="dayOfWeek"
            label="Hari"
            error={state.fieldErrors?.dayOfWeek}
          >
            <Select id="dayOfWeek" name="dayOfWeek" defaultValue="1">
              {Object.entries(dayOfWeekLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            id="startTime"
            label="Jam mulai"
            error={state.fieldErrors?.startTime}
          >
            <Input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue="18:00"
            />
          </Field>
          <Field
            id="endTime"
            label="Jam selesai"
            error={state.fieldErrors?.endTime}
          >
            <Input
              id="endTime"
              name="endTime"
              type="time"
              required
              defaultValue="20:00"
            />
          </Field>
        </div>
        <div>
          <SubmitButton pendingLabel="Menambah…">Tambah jadwal</SubmitButton>
        </div>
      </form>
    </div>
  );
}
