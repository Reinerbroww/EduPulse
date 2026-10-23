import type { Metadata } from "next";

import { FormPage } from "@/components/app/form-page";
import { GoalForm } from "@/components/app/goal-form";
import { requireUser } from "@/lib/auth/guards";
import { listActiveTopics } from "@/lib/data/topics";

export const metadata: Metadata = { title: "Tujuan baru" };

export default async function NewGoalPage() {
  await requireUser("/goals/new");
  const topics = await listActiveTopics();

  return (
    <FormPage
      title="Buat tujuan belajar"
      description="Tetapkan target konkret dan pilih dukungan yang kamu butuhkan."
      backHref="/goals"
      backLabel="Semua tujuan"
    >
      <GoalForm topics={topics} />
    </FormPage>
  );
}
