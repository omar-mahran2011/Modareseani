"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { uploadAvatarIfPresent } from "@/lib/supabase/storage";
import { citySchema, referenceItemSchema, teacherProfileSchema } from "@/lib/validations/schemas";
import type { ActionResult } from "@/actions/auth";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "يجب تسجيل الدخول" as const };

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) return { supabase, user: null, error: "غير مصرح لك بهذا الإجراء" as const };
  return { supabase, user, error: null };
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------
export async function adminSetTeacherPublishedAction(
  teacherId: string,
  published: boolean
): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const { error: updateError } = await supabase
    .from("teachers")
    .update({ is_published: published })
    .eq("profile_id", teacherId);
  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${teacherId}`);
  return { success: true };
}

export async function adminSetTeacherFounderAction(
  teacherId: string,
  isFounder: boolean
): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const { error: updateError } = await supabase
    .from("teachers")
    .update({ is_founder: isFounder })
    .eq("profile_id", teacherId);
  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${teacherId}`);
  return { success: true };
}

export async function adminUpdateTeacherAction(
  teacherId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const parsed = teacherProfileSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    governorateId: Number(formData.get("governorateId")),
    cityId: Number(formData.get("cityId")),
    subjectIds: formData.getAll("subjectIds").map(Number),
    yearsExperience: Number(formData.get("yearsExperience") ?? 0),
    bio: String(formData.get("bio") ?? ""),
    gradeLevels: formData.getAll("gradeLevels").map(String),
    teachingMethod: String(formData.get("teachingMethod") ?? "both"),
    educationSystem: String(formData.get("educationSystem") ?? "") || undefined,
    availableTimes: String(formData.get("availableTimes") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const isPublished = formData.get("isPublished") === "true";

  const avatarFile = formData.get("avatar");
  const { url: avatarUrl, error: avatarError } = await uploadAvatarIfPresent(
    supabase,
    teacherId,
    avatarFile instanceof File ? avatarFile : null
  );
  if (avatarError) return { error: avatarError };

  // profiles is the source of truth; the sync trigger propagates
  // full_name/governorate_id/city_id/phone onto teachers automatically.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      governorate_id: parsed.data.governorateId,
      city_id: parsed.data.cityId,
      phone: parsed.data.phone || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", teacherId);
  if (profileError) return { error: profileError.message };

  const { error: teacherError } = await supabase
    .from("teachers")
    .update({
      bio: parsed.data.bio,
      years_experience: parsed.data.yearsExperience,
      grade_levels: parsed.data.gradeLevels,
      teaching_method: parsed.data.teachingMethod,
      education_system: parsed.data.educationSystem ?? null,
      available_times: parsed.data.availableTimes || "",
      whatsapp: parsed.data.whatsapp || null,
      is_published: isPublished,
    })
    .eq("profile_id", teacherId);
  if (teacherError) return { error: teacherError.message };

  await supabase.from("teacher_subjects").delete().eq("teacher_id", teacherId);
  const { error: subjectsError } = await supabase
    .from("teacher_subjects")
    .insert(parsed.data.subjectIds.map((subjectId) => ({ teacher_id: teacherId, subject_id: subjectId })));
  if (subjectsError) return { error: subjectsError.message };

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${teacherId}`);
  return { success: true };
}

export async function adminDeleteTeacherAction(teacherId: string): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const { error: deleteError } = await supabase.from("teachers").delete().eq("profile_id", teacherId);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  return { success: true };
}

/**
 * Creates a brand-new teacher account on behalf of someone who can't self
 * register (requires SUPABASE_SERVICE_ROLE_KEY to be configured — see
 * README). Sends the new teacher a password-setup email.
 */
export async function adminCreateTeacherAccountAction(formData: FormData): Promise<ActionResult> {
  const { user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return {
      error:
        "لإضافة حساب معلم جديد من لوحة التحكم يجب إعداد SUPABASE_SERVICE_ROLE_KEY في متغيرات البيئة. راجع ملف README.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const governorateId = Number(formData.get("governorateId"));
  const cityId = Number(formData.get("cityId"));

  if (!email || !fullName || !governorateId || !cityId) {
    return { error: "البريد الإلكتروني والاسم والمحافظة والمدينة مطلوبة" };
  }

  const tempPassword = crypto.randomUUID();

  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      account_type: "teacher",
      governorate_id: governorateId,
      city_id: cityId,
    },
  });
  if (createError) return { error: createError.message };

  const newUserId = created.user?.id;
  if (!newUserId) return { error: "تعذر إنشاء الحساب" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  await serviceClient.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl ? `${siteUrl}/reset-password` : undefined,
  });

  revalidatePath("/admin/teachers");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function adminDeleteReviewAction(reviewId: number, teacherId: string): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const { error: deleteError } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/reviews");
  revalidatePath(`/teachers/${teacherId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Governorates
// ---------------------------------------------------------------------------
export async function adminCreateGovernorateAction(formData: FormData): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const parsed = referenceItemSchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const { error: insertError } = await supabase.from("governorates").insert({ name: parsed.data.name });
  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/governorates");
  return { success: true };
}

export async function adminUpdateGovernorateAction(id: number, formData: FormData): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const parsed = referenceItemSchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const { error: updateError } = await supabase
    .from("governorates")
    .update({ name: parsed.data.name })
    .eq("id", id);
  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/governorates");
  return { success: true };
}

export async function adminDeleteGovernorateAction(id: number): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const { error: deleteError } = await supabase.from("governorates").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/governorates");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------
export async function adminCreateCityAction(formData: FormData): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const parsed = citySchema.safeParse({
    governorateId: Number(formData.get("governorateId")),
    name: String(formData.get("name") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const { error: insertError } = await supabase
    .from("cities")
    .insert({ governorate_id: parsed.data.governorateId, name: parsed.data.name });
  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/cities");
  return { success: true };
}

export async function adminUpdateCityAction(id: number, formData: FormData): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const parsed = citySchema.safeParse({
    governorateId: Number(formData.get("governorateId")),
    name: String(formData.get("name") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const { error: updateError } = await supabase
    .from("cities")
    .update({ governorate_id: parsed.data.governorateId, name: parsed.data.name })
    .eq("id", id);
  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/cities");
  return { success: true };
}

export async function adminDeleteCityAction(id: number): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const { error: deleteError } = await supabase.from("cities").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/cities");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------
export async function adminCreateSubjectAction(formData: FormData): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const parsed = referenceItemSchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const { error: insertError } = await supabase.from("subjects").insert({ name: parsed.data.name });
  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function adminUpdateSubjectAction(id: number, formData: FormData): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const parsed = referenceItemSchema.safeParse({ name: String(formData.get("name") ?? "") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const { error: updateError } = await supabase
    .from("subjects")
    .update({ name: parsed.data.name })
    .eq("id", id);
  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function adminDeleteSubjectAction(id: number): Promise<ActionResult> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "غير مصرح" };

  const { error: deleteError } = await supabase.from("subjects").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/subjects");
  return { success: true };
}
