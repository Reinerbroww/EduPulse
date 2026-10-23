"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { createMentorService } from "@/lib/mentor/actions";
import { initialFormState } from "@/lib/forms/state";
import type { TopicRow } from "@/lib/data/topics";

export function MentorServiceForm({ topics }: { topics: TopicRow[] }) {
  const [state, formAction] = useActionState(
    createMentorService,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <p className="rounded-[var(--radius-control)] border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-ink">
        Pembayaran daring belum aktif pada MVP. Layanan berbayar dapat dicatat,
        tetapi pengajuan sesi berbayar belum dapat dilakukan.
      </p>

      <Field id="title" label="Judul layanan" error={state.fieldErrors?.title}>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="Contoh: Sesi tanya jawab Aljabar"
        />
      </Field>

      <Field
        id="description"
        label="Deskripsi"
        error={state.fieldErrors?.description}
      >
        <Textarea
          id="description"
          name="description"
          required
          maxLength={2000}
          placeholder="Apa yang akan dibahas dan untuk siapa."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="topicId" label="Topik (opsional)">
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
          id="durationMinutes"
          label="Durasi (menit)"
          error={state.fieldErrors?.durationMinutes}
        >
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={15}
            max={480}
            step={15}
            defaultValue={60}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="deliveryMode"
          label="Mode"
          error={state.fieldErrors?.deliveryMode}
        >
          <Select id="deliveryMode" name="deliveryMode" defaultValue="online_external">
            <option value="online_external">Online (tautan eksternal)</option>
            <option value="in_person">Tatap muka</option>
          </Select>
        </Field>

        <Field
          id="priceType"
          label="Jenis harga"
          error={state.fieldErrors?.priceType}
        >
          <Select id="priceType" name="priceType" defaultValue="free">
            <option value="free">Gratis</option>
            <option value="paid">Berbayar</option>
          </Select>
        </Field>
      </div>

      <Field
        id="priceAmount"
        label="Harga (IDR, isi 0 jika gratis)"
        error={state.fieldErrors?.priceAmount}
      >
        <Input
          id="priceAmount"
          name="priceAmount"
          type="number"
          min={0}
          step={1000}
          defaultValue={0}
        />
      </Field>

      <Field
        id="cancellationPolicy"
        label="Ketentuan pembatalan"
        error={state.fieldErrors?.cancellationPolicy}
      >
        <Textarea
          id="cancellationPolicy"
          name="cancellationPolicy"
          required
          maxLength={1000}
          placeholder="Contoh: Batalkan minimal 12 jam sebelum sesi."
        />
      </Field>

      <div>
        <SubmitButton pendingLabel="Menyimpan…">Tambah layanan</SubmitButton>
      </div>
    </form>
  );
}
