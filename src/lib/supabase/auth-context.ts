import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export interface AuthContext {
  userId: string;
  email: string;
  profile: Profile;
  isAdmin: boolean;
}

/**
 * Fetches the authenticated user's profile and admin status in one round
 * trip. Returns null if there is no authenticated session or the profile
 * row has not been created yet (should be rare given the auth.users trigger).
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
  ]);

  if (!profile) return null;

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
    isAdmin: Boolean(roleRow),
  };
}
