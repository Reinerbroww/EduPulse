"use client";

import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/auth/actions";
import { initialAuthState } from "@/lib/auth/state";

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialAuthState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <Field
        id="password"
        label="Kata sandi baru"
        hint="Minimal 8 karakter."
        error={state.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </Field>

      <Field
        id="confirmPassword"
        label="Ulangi kata sandi baru"
        error={state.fieldErrors?.confirmPassword}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Menyimpan…">
        Simpan kata sandi
      </SubmitButton>
    </form>
  );
}
