"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/actions";
import { initialAuthState } from "@/lib/auth/state";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "";
  const [state, formAction] = useActionState(signIn, initialAuthState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <AuthFormMessage state={state} />

      <input type="hidden" name="redirectTo" value={redirectTo} />

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
        error={state.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>

      <SubmitButton className="w-full">Masuk</SubmitButton>

      <div className="flex items-center justify-between text-sm">
        <Link href="/reset-password" className="text-primary">
          Lupa kata sandi?
        </Link>
        <Link href="/signup" className="text-primary">
          Buat akun
        </Link>
      </div>
    </form>
  );
}
