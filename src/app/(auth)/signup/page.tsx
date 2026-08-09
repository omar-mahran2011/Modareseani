import { SignupForm } from "@/components/auth/signup-form";
import { getAllCities, getGovernorates, getSubjects } from "@/lib/data/reference";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default async function SignupPage() {
  const supabase = await createClient();
  const [governorates, cities, subjects] = await Promise.all([
    getGovernorates(supabase),
    getAllCities(supabase),
    getSubjects(supabase),
  ]);

  return <SignupForm governorates={governorates} cities={cities} subjects={subjects} />;
}
