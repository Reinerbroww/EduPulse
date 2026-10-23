import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SupabaseSetupNotice } from "@/components/app/supabase-notice";

export const metadata: Metadata = { title: "Reset kata sandi" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Atur ulang kata sandi"
      description="Masukkan email terdaftar. Kami akan mengirim tautan untuk membuat kata sandi baru."
    >
      <SupabaseSetupNotice />
      <ResetPasswordForm />
    </AuthCard>
  );
}
