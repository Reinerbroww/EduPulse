import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormPage } from "@/components/app/form-page";
import { GoalForm } from "@/components/app/goal-form";
import { requireUser } from "@/lib/auth/guards";
import { getLearningGoal } from "@/lib/data/goals";
import { listActiveTopics } from "@/lib/data/topics";

export const metadata: Metadata = { title: "Ubah tujuan" };

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;
  const user = await requireUser(`/goals/${goalId}/edit`);
  const [goal, topics] = await Promise.all([
    getLearningGoal(goalId, user.id),
    listActiveTopics(),
  ]);

  if (!goal) notFound();

  return (
    <FormPage
      title="Ubah tujuan belajar"
      description="Perbarui target, topik, atau visibilitas tujuan ini."
      backHref={`/goals/${goalId}`}
      backLabel="Kembali ke progres"
    >
      <GoalForm topics={topics} goal={goal} />
    </FormPage>
  );
}
