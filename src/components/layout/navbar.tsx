import { getAuthContext } from "@/lib/supabase/auth-context";
import { SiteHeader } from "@/components/layout/site-header";

export async function Navbar() {
  const auth = await getAuthContext();

  return (
    <SiteHeader
      user={
        auth
          ? {
              fullName: auth.profile.full_name || auth.email,
              avatarUrl: auth.profile.avatar_url,
              isAdmin: auth.isAdmin,
            }
          : null
      }
    />
  );
}
