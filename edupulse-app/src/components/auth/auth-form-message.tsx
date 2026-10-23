"use client";

import { Alert } from "@/components/ui/alert";
import type { AuthState } from "@/lib/auth/state";

export function AuthFormMessage({ state }: { state: AuthState }) {
  if (!state.message) return null;

  return (
    <Alert tone={state.status === "error" ? "danger" : "success"}>
      {state.message}
    </Alert>
  );
}
