import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ReviewWithAuthor, TeacherWithProfile } from "@/lib/types/database";
import { buildLocationLookup, getAllCities, getGovernorates } from "@/lib/data/reference";

type Client = SupabaseClient<Database>;

export interface TeacherFilters {
  governorateId?: number;
  cityId?: number;
  subjectId?: number;
  minRating?: number;
  minExperience?: number;
  query?: string;
  sort?: "rating" | "experience" | "newest";
}

const TEACHER_SELECT = `
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
  is_founder,
  avg_rating,
  ratings_count,
  created_at,
  updated_at,
  teacher_subjects ( subject:subjects ( id, name ) )
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeacherRow(row: any): TeacherWithProfile {
  return {
    profile_id: row.profile_id,
    display_name: row.display_name ?? "",
    avatar_url: row.avatar_url,
    governorate_id: row.governorate_id,
    city_id: row.city_id,
    bio: row.bio,
    years_experience: row.years_experience,
    grade_levels: row.grade_levels ?? [],
    teaching_method: row.teaching_method,
    education_system: row.education_system,
    available_times: row.available_times ?? "",
    phone: row.phone,
    whatsapp: row.whatsapp,
    is_published: row.is_published,
    is_founder: row.is_founder ?? false,
    avg_rating: Number(row.avg_rating ?? 0),
    ratings_count: row.ratings_count ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subjects: (row.teacher_subjects ?? []).map((ts: any) => ts.subject).filter(Boolean),
  };
}

async function withLocationNames(
  supabase: Client,
  teachers: TeacherWithProfile[]
): Promise<TeacherWithProfile[]> {
  const [governorates, cities] = await Promise.all([
    getGovernorates(supabase),
    getAllCities(supabase),
  ]);
  const { governorateNameById, cityNameById } = buildLocationLookup(governorates, cities);

  return teachers.map((t) => ({
    ...t,
    governorate_name: t.governorate_id ? governorateNameById.get(t.governorate_id) : undefined,
    city_name: t.city_id ? cityNameById.get(t.city_id) : undefined,
  }));
}

/**
 * Fetches published teachers matching the given filters. Everything needed
 * for filtering (name, governorate, city) lives directly on `teachers` as a
 * denormalized, always-in-sync copy of the owner's profile — see the
 * sync_teacher_public_fields trigger — so this never needs to touch the
 * private `profiles` table.
 */
export async function getTeachers(
  supabase: Client,
  filters: TeacherFilters = {},
  pagination?: { page: number; pageSize: number }
): Promise<{ teachers: TeacherWithProfile[]; total: number }> {
  let candidateIds: string[] | null = null;

  if (filters.subjectId) {
    const { data, error } = await supabase
      .from("teacher_subjects")
      .select("teacher_id")
      .eq("subject_id", filters.subjectId);
    if (error) throw new Error(error.message);
    candidateIds = (data ?? []).map((r) => r.teacher_id);
    if (candidateIds.length === 0) return { teachers: [], total: 0 };
  }

  let teacherQuery = supabase
    .from("teachers")
    .select(TEACHER_SELECT, { count: "exact" })
    .eq("is_published", true);

  if (candidateIds) teacherQuery = teacherQuery.in("profile_id", candidateIds);
  if (filters.governorateId) teacherQuery = teacherQuery.eq("governorate_id", filters.governorateId);
  if (filters.cityId) teacherQuery = teacherQuery.eq("city_id", filters.cityId);
  if (filters.query) teacherQuery = teacherQuery.ilike("display_name", `%${filters.query}%`);
  if (filters.minRating) teacherQuery = teacherQuery.gte("avg_rating", filters.minRating);
  if (filters.minExperience) teacherQuery = teacherQuery.gte("years_experience", filters.minExperience);

  // Founders always get priority placement, regardless of sort mode —
  // within that, the chosen sort still applies.
  teacherQuery = teacherQuery.order("is_founder", { ascending: false });

  switch (filters.sort) {
    case "experience":
      teacherQuery = teacherQuery.order("years_experience", { ascending: false });
      break;
    case "newest":
      teacherQuery = teacherQuery.order("created_at", { ascending: false });
      break;
    case "rating":
    default:
      teacherQuery = teacherQuery
        .order("avg_rating", { ascending: false })
        .order("ratings_count", { ascending: false });
      break;
  }

  if (pagination) {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    teacherQuery = teacherQuery.range(from, to);
  }

  const { data, error, count } = await teacherQuery;
  if (error) throw new Error(error.message);

  const teachers = (data ?? []).map(mapTeacherRow);
  return { teachers: await withLocationNames(supabase, teachers), total: count ?? teachers.length };
}

/**
 * Full-text-ish search across name and subject name, used by the search box
 * and by /api/teachers. Kept separate from getTeachers so the directory page
 * (server-rendered, filter-driven) and the search API (query-driven) can
 * evolve independently.
 */
export async function searchTeachers(
  supabase: Client,
  query: string
): Promise<TeacherWithProfile[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    const { teachers } = await getTeachers(supabase, { sort: "rating" });
    return teachers;
  }

  const [{ data: byName, error: nameError }, { data: subjectMatches, error: subjectError }] =
    await Promise.all([
      supabase
        .from("teachers")
        .select(TEACHER_SELECT)
        .eq("is_published", true)
        .ilike("display_name", `%${trimmed}%`),
      supabase.from("subjects").select("id, name").ilike("name", `%${trimmed}%`),
    ]);

  if (nameError) throw new Error(nameError.message);
  if (subjectError) throw new Error(subjectError.message);

  const results = new Map<string, TeacherWithProfile>();
  (byName ?? []).map(mapTeacherRow).forEach((t) => results.set(t.profile_id, t));

  const subjectIds = (subjectMatches ?? []).map((s) => s.id);
  if (subjectIds.length > 0) {
    const { data: viaSubject, error: viaSubjectError } = await supabase
      .from("teacher_subjects")
      .select("teacher_id")
      .in("subject_id", subjectIds);
    if (viaSubjectError) throw new Error(viaSubjectError.message);

    const ids = Array.from(new Set((viaSubject ?? []).map((r) => r.teacher_id))).filter(
      (id) => !results.has(id)
    );
    if (ids.length > 0) {
      const { data: extra, error: extraError } = await supabase
        .from("teachers")
        .select(TEACHER_SELECT)
        .eq("is_published", true)
        .in("profile_id", ids);
      if (extraError) throw new Error(extraError.message);
      (extra ?? []).map(mapTeacherRow).forEach((t) => results.set(t.profile_id, t));
    }
  }

  return withLocationNames(supabase, Array.from(results.values()));
}

export async function getTeacherById(
  supabase: Client,
  profileId: string
): Promise<TeacherWithProfile | null> {
  const { data, error } = await supabase
    .from("teachers")
    .select(TEACHER_SELECT)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const [withNames] = await withLocationNames(supabase, [mapTeacherRow(data)]);
  return withNames ?? null;
}

export async function getReviewsForTeacher(
  supabase: Client,
  teacherId: string
): Promise<ReviewWithAuthor[]> {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, rating_id, teacher_id, user_id, author_name, author_avatar_url, comment, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  if (!reviews || reviews.length === 0) return [];

  const ratingIds = reviews.map((r) => r.rating_id);
  const { data: ratings, error: ratingsError } = await supabase
    .from("ratings")
    .select("id, stars")
    .in("id", ratingIds);
  if (ratingsError) throw new Error(ratingsError.message);

  const starsByRatingId = new Map((ratings ?? []).map((r) => [r.id, r.stars]));

  return reviews.map((r) => ({
    ...r,
    stars: starsByRatingId.get(r.rating_id) ?? 0,
  }));
}

export async function getMyRatingForTeacher(
  supabase: Client,
  teacherId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("ratings")
    .select("id, stars")
    .eq("teacher_id", teacherId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMyReviewText(
  supabase: Client,
  teacherId: string,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from("reviews")
    .select("comment")
    .eq("teacher_id", teacherId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.comment ?? "";
}
