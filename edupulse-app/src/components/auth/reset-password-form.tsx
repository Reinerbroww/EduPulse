"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth/actions";
import { initialAuthState } from "@/lib/auth/state";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordReset,
    initialAuthState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Mengirim…">
        Kirim tautan reset
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-primary">
          Kembali ke halaman masuk
        </Link>
      </p>
    </form>
  );
}
