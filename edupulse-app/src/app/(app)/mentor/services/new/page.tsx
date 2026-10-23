import type { Metadata } from "next";

import { FormPage } from "@/components/app/form-page";
import { MentorServiceForm } from "@/components/app/mentor-service-form";
import { requireUser } from "@/lib/auth/guards";
import { listActiveTopics } from "@/lib/data/topics";

export const metadata: Metadata = { title: "Layanan baru" };

export default async function NewMentorServicePage() {
  await requireUser("/mentor/services/new");
  const topics = await listActiveTopics();

  return (
    <FormPage
      title="Tambah layanan mentoring"
      description="Tentukan judul, durasi, mode, dan harga layanan yang kamu tawarkan."
      backHref="/mentor"
      backLabel="Ruang Mentor"
    >
      <MentorServiceForm topics={topics} />
    </FormPage>
  );
}
