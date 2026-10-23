import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { SupabaseSetupNotice } from "@/components/app/supabase-notice";

export const metadata: Metadata = { title: "Kata sandi baru" };

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      title="Buat kata sandi baru"
      description="Tautan reset sudah diverifikasi. Tentukan kata sandi baru untuk akunmu."
    >
      <SupabaseSetupNotice />
      <UpdatePasswordForm />
    </AuthCard>
  );
}
