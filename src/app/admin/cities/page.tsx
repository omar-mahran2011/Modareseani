import { CityManager } from "@/components/admin/city-manager";
import { getAllCities, getGovernorates } from "@/lib/data/reference";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة المدن" };

export default async function AdminCitiesPage() {
  const supabase = await createClient();
  const [cities, governorates] = await Promise.all([getAllCities(supabase), getGovernorates(supabase)]);

  return <CityManager cities={cities} governorates={governorates} />;
}
