import type { Metadata } from "next";

import { OnboardingForm } from "@/components/app/onboarding-form";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";
import { getCurrentUserContext } from "@/lib/data/profile";
import { listActiveTopics, listUserTopicIds } from "@/lib/data/topics";

export const metadata: Metadata = { title: "Profil belajar" };

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  const [context, topics, selectedTopicIds] = await Promise.all([
    getCurrentUserContext(),
    listActiveTopics(),
    listUserTopicIds(user.id),
  ]);

  const profile = context?.profile ?? null;
  const safety = context?.safety ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Profil belajar"
        description="Lengkapi data untuk membantu EduPulse mencocokkan partner, kelompok, dan mentor yang tepat."
      />

      <Card>
        <CardContent className="pt-5">
          <OnboardingForm
            topics={topics}
            defaultDisplayName={profile?.display_name ?? ""}
            defaultEducationLevel={profile?.education_level ?? null}
            defaultAgeBand={safety?.age_band ?? "not_set"}
            defaultVisibility={safety?.profile_visibility ?? "discoverable"}
            defaultTimezone={profile?.timezone ?? "UTC"}
            defaultSkillLevel="beginner"
            selectedTopicIds={selectedTopicIds}
          />
        </CardContent>
      </Card>
    </div>
  );
}
