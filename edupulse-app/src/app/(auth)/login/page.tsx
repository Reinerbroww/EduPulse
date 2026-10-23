import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SupabaseSetupNotice } from "@/components/app/supabase-notice";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Masuk ke EduPulse"
      description="Lanjutkan perjalanan belajarmu bersama partner, kelompok, dan mentor."
    >
      <SupabaseSetupNotice />
      <Suspense fallback={<div className="h-56" aria-hidden />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
