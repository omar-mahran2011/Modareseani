"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatarIfPresent } from "@/lib/supabase/storage";
import { studentProfileSchema, teacherProfileSchema } from "@/lib/validations/schemas";
import type { ActionResult } from "@/actions/auth";

export async function updateStudentProfileAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const parsed = studentProfileSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    governorateId: Number(formData.get("governorateId")),
    cityId: Number(formData.get("cityId")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const avatarFile = formData.get("avatar");
  const { url: avatarUrl, error: avatarError } = await uploadAvatarIfPresent(
    supabase,
    user.id,
    avatarFile instanceof File ? avatarFile : null
  );
  if (avatarError) return { error: avatarError };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      governorate_id: parsed.data.governorateId,
      city_id: parsed.data.cityId,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/teachers");
  return { success: true };
}

export async function updateTeacherProfileAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

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

  const avatarFile = formData.get("avatar");
  const { url: avatarUrl, error: avatarError } = await uploadAvatarIfPresent(
    supabase,
    user.id,
    avatarFile instanceof File ? avatarFile : null
  );
  if (avatarError) return { error: avatarError };

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  const finalAvatarUrl = avatarUrl || existingProfile?.avatar_url || null;
  if (!finalAvatarUrl) {
    return { error: "الصورة الشخصية مطلوبة قبل نشر ملفك كمعلم" };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      governorate_id: parsed.data.governorateId,
      city_id: parsed.data.cityId,
      phone: parsed.data.phone || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  const { error: upsertError } = await supabase.from("teachers").upsert({
    profile_id: user.id,
    bio: parsed.data.bio,
    years_experience: parsed.data.yearsExperience,
    grade_levels: parsed.data.gradeLevels,
    teaching_method: parsed.data.teachingMethod,
    education_system: parsed.data.educationSystem ?? null,
    available_times: parsed.data.availableTimes || "",
    whatsapp: parsed.data.whatsapp || null,
    is_published: true,
  });
  if (upsertError) return { error: upsertError.message };

  const { error: deleteSubjectsError } = await supabase
    .from("teacher_subjects")
    .delete()
    .eq("teacher_id", user.id);
  if (deleteSubjectsError) return { error: deleteSubjectsError.message };

  const { error: insertSubjectsError } = await supabase
    .from("teacher_subjects")
    .insert(parsed.data.subjectIds.map((subjectId) => ({ teacher_id: user.id, subject_id: subjectId })));
  if (insertSubjectsError) return { error: insertSubjectsError.message };

  revalidatePath("/settings");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${user.id}`);
  return { success: true };
}

export async function switchAccountTypeAction(
  newType: "student" | "teacher"
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const { error } = await supabase
    .from("profiles")
    .update({ account_type: newType })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/teachers");
  return { success: true };
}

export async function completeOnboardingAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const accountType = String(formData.get("accountType") ?? "student") as "student" | "teacher";
  const governorateId = Number(formData.get("governorateId"));
  const cityId = Number(formData.get("cityId"));

  if (fullName.length < 3) return { error: "الاسم الكامل مطلوب" };
  if (!governorateId) return { error: "اختر المحافظة" };
  if (!cityId) return { error: "اختر المدينة" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      account_type: accountType,
      governorate_id: governorateId,
      city_id: cityId,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
