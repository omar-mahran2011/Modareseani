import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { GraduationCap } from "lucide-react";
import { getAllCities, getGovernorates } from "@/lib/data/reference";
import { getAuthContext } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "إكمال إعداد الحساب" };

export default async function OnboardingPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.profile.governorate_id && auth.profile.city_id) redirect("/teachers");

  const supabase = await createClient();
  const [governorates, cities] = await Promise.all([getGovernorates(supabase), getAllCities(supabase)]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-ink-800 text-gold-300 dark:bg-gold-400 dark:text-ink-950">
          <GraduationCap className="size-7" />
        </span>
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">
          خطوة أخيرة قبل البدء
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          حدد محافظتك ومدينتك لنعرض لك المعلمين القريبين منك
        </p>
      </div>
      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800/60">
        <OnboardingForm
          defaultFullName={auth.profile.full_name}
          governorates={governorates}
          cities={cities}
        />
      </div>
    </div>
  );
}
