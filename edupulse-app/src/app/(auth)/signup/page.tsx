import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/signup-form";
import { SupabaseSetupNotice } from "@/components/app/supabase-notice";

export const metadata: Metadata = { title: "Daftar" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Buat akun EduPulse"
      description="Buat profil belajar, tetapkan tujuan, lalu temukan dukungan yang cocok."
    >
      <SupabaseSetupNotice />
      <SignUpForm />
    </AuthCard>
  );
}
