import { updateTeacherProfileAction } from "@/actions/profile";
import type { ActionResult } from "@/actions/auth";
import { AccountTypeSwitch } from "@/components/settings/account-type-switch";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { StudentProfileForm } from "@/components/settings/student-profile-form";
import { TeacherProfileForm } from "@/components/settings/teacher-profile-form";
import { Badge, Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { getAllCities, getGovernorates, getSubjects } from "@/lib/data/reference";
import { getTeacherById } from "@/lib/data/teachers";
import { getAuthContext } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "الإعدادات" };

async function teacherFormAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  "use server";
  return updateTeacherProfileAction(formData);
}

export default async function SettingsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  const supabase = await createClient();
  const [governorates, cities, subjects] = await Promise.all([
    getGovernorates(supabase),
    getAllCities(supabase),
    getSubjects(supabase),
  ]);

  const teacher =
    auth.profile.account_type === "teacher" ? await getTeacherById(supabase, auth.userId) : null;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 py-8 sm:px-6">
      <BackButton fallbackHref="/teachers" className="mb-2" />
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">الإعدادات</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">إدارة بيانات حسابك ونوعه</p>

      <div className="mt-6">
        <AccountTypeSwitch currentType={auth.profile.account_type} />
      </div>

      {auth.profile.account_type === "teacher" && (!teacher || !teacher.is_published) && (
        <div className="mt-4 rounded-xl bg-gold-100 px-4 py-3 text-sm text-gold-700 dark:bg-gold-400/10 dark:text-gold-300">
          أكمل البيانات التالية ليظهر ملفك في نتائج البحث. الصورة الشخصية مطلوبة.
        </div>
      )}

      <Card className="mt-4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            {auth.profile.account_type === "teacher" ? "بيانات ملف المعلم" : "البيانات الشخصية"}
          </h2>
          {teacher && (
            <Badge tone={teacher.is_published ? "teal" : "neutral"}>
              {teacher.is_published ? "منشور" : "غير منشور"}
            </Badge>
          )}
        </div>

        {auth.profile.account_type === "teacher" ? (
          <TeacherProfileForm
            governorates={governorates}
            cities={cities}
            subjects={subjects}
            action={teacherFormAction}
            submitLabel="حفظ ونشر الملف"
            initialValues={{
              fullName: auth.profile.full_name,
              governorateId: auth.profile.governorate_id,
              cityId: auth.profile.city_id,
              subjectIds: teacher?.subjects.map((s) => s.id) ?? [],
              yearsExperience: teacher?.years_experience ?? 0,
              bio: teacher?.bio ?? "",
              gradeLevels: teacher?.grade_levels ?? [],
              teachingMethod: teacher?.teaching_method ?? "both",
              educationSystem: teacher?.education_system ?? null,
              availableTimes: teacher?.available_times ?? "",
              phone: auth.profile.phone ?? "",
              whatsapp: teacher?.whatsapp ?? "",
              avatarUrl: auth.profile.avatar_url,
            }}
          />
        ) : (
          <StudentProfileForm
            governorates={governorates}
            cities={cities}
            initialValues={{
              fullName: auth.profile.full_name,
              governorateId: auth.profile.governorate_id,
              cityId: auth.profile.city_id,
              phone: auth.profile.phone ?? "",
              avatarUrl: auth.profile.avatar_url,
            }}
          />
        )}
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">
          تغيير كلمة المرور
        </h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
