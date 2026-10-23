import type { Metadata } from "next";

import { FormPage } from "@/components/app/form-page";
import { MentorSlotForm } from "@/components/app/mentor-slot-form";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Jadwal baru" };

export default async function NewMentorSlotPage() {
  await requireUser("/mentor/slots/new");

  return (
    <FormPage
      title="Tambah jadwal tersedia"
      description="Tetapkan rentang waktu ketika kamu siap menerima sesi mentoring."
      backHref="/mentor"
      backLabel="Ruang Mentor"
    >
      <MentorSlotForm />
    </FormPage>
  );
}
