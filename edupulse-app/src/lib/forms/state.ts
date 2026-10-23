// Generic result shape for server actions driven by `useActionState`.
// Kept outside "use server" modules because those may only export async functions.

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };
