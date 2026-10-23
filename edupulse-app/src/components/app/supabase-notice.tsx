import { Alert } from "@/components/ui/alert";
import { envSetupMessage, isSupabaseConfigured } from "@/lib/env";

// Rendered on auth pages when the Supabase environment is missing so local
// development fails with guidance instead of a confusing runtime error.
export function SupabaseSetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <Alert tone="warning" className="mb-4">
      {envSetupMessage}
    </Alert>
  );
}
