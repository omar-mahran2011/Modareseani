import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Service-role client used ONLY for the admin "create a teacher account on
 * someone's behalf" flow (auth.admin.createUser requires elevated
 * privileges that RLS + the anon key cannot provide).
 *
 * SUPABASE_SERVICE_ROLE_KEY is optional and must never be exposed to the
 * browser (no NEXT_PUBLIC_ prefix). If it isn't configured, this returns
 * null and the calling action degrades gracefully.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
