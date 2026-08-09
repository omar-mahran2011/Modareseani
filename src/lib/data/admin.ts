import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminReviewRow, AdminTeacherRow, AdminUserRow, Database } from "@/lib/types/database";
import { buildLocationLookup, getAllCities, getGovernorates } from "@/lib/data/reference";

type Client = SupabaseClient<Database>;

// Admins may read every profile row (RLS: profiles_select_owner_or_admin),
// so the only reason to touch `profiles` here at all is to surface each
// teacher's private email address for the admin's "view users / contact"
// need. Every other display field comes from the denormalized copy on
// `teachers`, consistent with how the public directory reads it.
const ADMIN_TEACHER_SELECT = `
  profile_id,
  display_name,
  avatar_url,
  governorate_id,
  city_id,
  bio,
  years_experience,
  grade_levels,
  teaching_method,
  education_system,
  available_times,
  phone,
  whatsapp,
  is_published,
  avg_rating,
  ratings_count,
  created_at,
  updated_at,
  profile:profiles!teachers_profile_id_fkey ( email ),
  teacher_subjects ( subject:subjects ( id, name ) )
`;

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  publishedTeachers: number;
  totalReviews: number;
}

export async function getAdminStats(supabase: Client): Promise<AdminStats> {
  const [users, students, teachers, published, reviews] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_type", "student"),
    supabase.from("teachers").select("profile_id", { count: "exact", head: true }),
    supabase
      .from("teachers")
      .select("profile_id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalStudents: students.count ?? 0,
    totalTeachers: teachers.count ?? 0,
    publishedTeachers: published.count ?? 0,
    totalReviews: reviews.count ?? 0,
  };
}

export async function getAllTeachersForAdmin(supabase: Client): Promise<AdminTeacherRow[]> {
  const { data, error } = await supabase
    .from("teachers")
    .select(ADMIN_TEACHER_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const [governorates, cities] = await Promise.all([getGovernorates(supabase), getAllCities(supabase)]);
  const { governorateNameById, cityNameById } = buildLocationLookup(governorates, cities);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    avg_rating: Number(row.avg_rating ?? 0),
    email: row.profile?.email ?? "",
    subjects: (row.teacher_subjects ?? []).map((ts: { subject: { id: number; name: string } }) => ts.subject),
    governorate_name: row.governorate_id ? governorateNameById.get(row.governorate_id) : undefined,
    city_name: row.city_id ? cityNameById.get(row.city_id) : undefined,
  }));
}

export async function getTeacherForAdmin(
  supabase: Client,
  teacherId: string
): Promise<AdminTeacherRow | null> {
  const { data, error } = await supabase
    .from("teachers")
    .select(ADMIN_TEACHER_SELECT)
    .eq("profile_id", teacherId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const [governorates, cities] = await Promise.all([getGovernorates(supabase), getAllCities(supabase)]);
  const { governorateNameById, cityNameById } = buildLocationLookup(governorates, cities);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  return {
    ...row,
    avg_rating: Number(row.avg_rating ?? 0),
    email: row.profile?.email ?? "",
    subjects: (row.teacher_subjects ?? []).map((ts: { subject: { id: number; name: string } }) => ts.subject),
    governorate_name: row.governorate_id ? governorateNameById.get(row.governorate_id) : undefined,
    city_name: row.city_id ? cityNameById.get(row.city_id) : undefined,
  };
}

export async function getAllUsersForAdmin(supabase: Client): Promise<AdminUserRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const [governorates, cities] = await Promise.all([getGovernorates(supabase), getAllCities(supabase)]);
  const { governorateNameById, cityNameById } = buildLocationLookup(governorates, cities);

  return (data ?? []).map((p) => ({
    ...p,
    governorate_name: p.governorate_id ? governorateNameById.get(p.governorate_id) : undefined,
    city_name: p.city_id ? cityNameById.get(p.city_id) : undefined,
  }));
}

export async function getAdminIds(supabase: Client): Promise<Set<string>> {
  const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.user_id));
}

export async function getAllReviewsForAdmin(supabase: Client): Promise<AdminReviewRow[]> {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, rating_id, teacher_id, user_id, author_name, author_avatar_url, comment, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  if (!reviews || reviews.length === 0) return [];

  const ratingIds = reviews.map((r) => r.rating_id);
  const teacherIds = Array.from(new Set(reviews.map((r) => r.teacher_id)));

  const [{ data: ratings }, { data: teachers }] = await Promise.all([
    supabase.from("ratings").select("id, stars").in("id", ratingIds),
    supabase.from("teachers").select("profile_id, display_name").in("profile_id", teacherIds),
  ]);

  const starsByRatingId = new Map((ratings ?? []).map((r) => [r.id, r.stars]));
  const teacherNameById = new Map((teachers ?? []).map((t) => [t.profile_id, t.display_name]));

  return reviews.map((r) => ({
    ...r,
    stars: starsByRatingId.get(r.rating_id) ?? 0,
    teacher_name: teacherNameById.get(r.teacher_id) ?? "معلم",
  }));
}
