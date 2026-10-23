import type { Metadata } from "next";

import { FormPage } from "@/components/app/form-page";
import { MentorProfileForm } from "@/components/app/mentor-profile-form";
import { requireUser } from "@/lib/auth/guards";
import { getMyMentorProfile } from "@/lib/data/mentor-self";

export const metadata: Metadata = { title: "Profil mentor" };

export default async function MentorProfileFormPage() {
  const user = await requireUser("/mentor/profile");
  const profile = await getMyMentorProfile(user.id);
  const isCreate = !profile;

  return (
    <FormPage
      title={isCreate ? "Buat profil mentor" : "Ubah profil mentor"}
      description={
        isCreate
          ? "Lengkapi informasi dasar sebelum mengunggah CV dan mengajukan verifikasi."
          : "Perbarui judul, ringkasan keahlian, dan pengalaman yang kamu tawarkan."
      }
      backHref="/mentor"
      backLabel="Ruang Mentor"
    >
      <MentorProfileForm profile={profile} />
    </FormPage>
  );
}
