import { getAuthContext } from "@/lib/supabase/auth-context";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const auth = await getAuthContext();

  if (!auth) redirect("/login");
  if (!auth.profile.governorate_id || !auth.profile.city_id) redirect("/onboarding");
  redirect("/teachers");
}
