import type { Metadata } from "next";

import { FormPage } from "@/components/app/form-page";
import { GroupForm } from "@/components/app/group-form";
import { requireUser } from "@/lib/auth/guards";
import { getLearningGoals } from "@/lib/data/goals";
import { listActiveTopics } from "@/lib/data/topics";

export const metadata: Metadata = { title: "Kelompok baru" };

export default async function NewGroupPage() {
  await requireUser("/groups/new");
  const [topics, goals] = await Promise.all([
    listActiveTopics(),
    getLearningGoals(),
  ]);

  return (
    <FormPage
      title="Buat kelompok belajar"
      description="Tentukan topik, kapasitas, dan sampul kelompok yang kamu kelola."
      backHref="/groups"
      backLabel="Semua kelompok"
    >
      <GroupForm topics={topics} goals={goals} />
    </FormPage>
  );
}
