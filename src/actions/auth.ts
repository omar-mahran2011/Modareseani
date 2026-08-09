"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadAvatarIfPresent } from "@/lib/supabase/storage";
import {
  loginSchema,
  studentSignupSchema,
  teacherSignupSchema,
} from "@/lib/validations/schemas";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function firstZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "بيانات غير صحيحة";
}

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function signUpStudentAction(input: {
  fullName: string;
  email: string;
  password: string;
  governorateId: number;
  cityId: number;
}): Promise<ActionResult> {
  const parsed = studentSignupSchema.safeParse({ accountType: "student", ...input });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        account_type: "student",
        governorate_id: parsed.data.governorateId,
        city_id: parsed.data.cityId,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "هذا البريد الإلكتروني مسجل بالفعل" };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function signUpTeacherAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    accountType: "teacher" as const,
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    governorateId: Number(formData.get("governorateId")),
    cityId: Number(formData.get("cityId")),
    subjectIds: formData.getAll("subjectIds").map(Number),
    yearsExperience: Number(formData.get("yearsExperience") ?? 0),
    bio: String(formData.get("bio") ?? ""),
    gradeLevels: formData.getAll("gradeLevels").map(String),
    teachingMethod: String(formData.get("teachingMethod") ?? "both") as "online" | "offline" | "both",
    educationSystem: (String(formData.get("educationSystem") ?? "") || undefined) as
      | "national"
      | "azhari"
      | "american"
      | "british"
      | "ib"
      | "stem"
      | "other"
      | undefined,
    availableTimes: String(formData.get("availableTimes") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
  };

  const parsed = teacherSignupSchema.safeParse(raw);
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const avatarFileCheck = formData.get("avatar");
  if (!(avatarFileCheck instanceof File) || avatarFileCheck.size === 0) {
    return { error: "الصورة الشخصية مطلوبة" };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        account_type: "teacher",
        governorate_id: parsed.data.governorateId,
        city_id: parsed.data.cityId,
        phone: parsed.data.phone || null,
      },
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes("already registered")) {
      return { error: "هذا البريد الإلكتروني مسجل بالفعل" };
    }
    return { error: signUpError.message };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    // Email confirmation is required before a session exists; the teacher
    // can finish their profile from Settings after confirming their email.
    return { success: true };
  }

  const avatarFile = formData.get("avatar");
  const { url: avatarUrl, error: avatarError } = await uploadAvatarIfPresent(
    supabase,
    userId,
    avatarFile instanceof File ? avatarFile : null
  );
  if (avatarError) return { error: avatarError };
  if (!avatarUrl) return { error: "تعذر رفع الصورة الشخصية" };

  // Set the avatar on profiles first: the sync trigger copies it onto
  // teachers.avatar_url immediately, before we flip is_published to true.
  await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);

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
      is_published: true,
    })
    .eq("profile_id", userId);

  if (teacherError) return { error: teacherError.message };

  const { error: subjectsError } = await supabase
    .from("teacher_subjects")
    .insert(parsed.data.subjectIds.map((subjectId) => ({ teacher_id: userId, subject_id: subjectId })));

  if (subjectsError) return { error: subjectsError.message };

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl ? `${siteUrl}/reset-password` : undefined,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePasswordAction(newPassword: string): Promise<ActionResult> {
  if (newPassword.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}
