"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth/actions";
import { initialAuthState } from "@/lib/auth/state";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialAuthState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <Field
        id="displayName"
        label="Nama tampilan"
        hint="Nama yang dilihat pelajar lain."
        error={state.fieldErrors?.displayName}
      >
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          required
          placeholder="Mis. Rani P."
        />
      </Field>

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

      <Field
        id="password"
        label="Kata sandi"
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

      <SubmitButton className="w-full" pendingLabel="Membuat akun…">
        Daftar
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-primary">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
