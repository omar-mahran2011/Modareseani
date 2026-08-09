import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, City, Governorate, Subject } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

export async function getGovernorates(supabase: Client): Promise<Governorate[]> {
  const { data, error } = await supabase.from("governorates").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllCities(supabase: Client): Promise<City[]> {
  const { data, error } = await supabase.from("cities").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCitiesByGovernorate(
  supabase: Client,
  governorateId: number
): Promise<City[]> {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("governorate_id", governorateId)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSubjects(supabase: Client): Promise<Subject[]> {
  const { data, error } = await supabase.from("subjects").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function buildLocationLookup(governorates: Governorate[], cities: City[]) {
  const governorateNameById = new Map(governorates.map((g) => [g.id, g.name]));
  const cityNameById = new Map(cities.map((c) => [c.id, c.name]));
  return { governorateNameById, cityNameById };
}
