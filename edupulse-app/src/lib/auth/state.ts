// Shared auth action result shape. Kept out of the "use server" module because
// that module may only export async functions.

export type AuthState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAuthState: AuthState = { status: "idle" };
