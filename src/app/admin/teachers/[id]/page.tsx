import { adminUpdateTeacherAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/auth";
import { TeacherProfileForm } from "@/components/settings/teacher-profile-form";
import { Card } from "@/components/ui/card";
import { getAllCities, getGovernorates, getSubjects } from "@/lib/data/reference";
import { getTeacherForAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "تعديل بيانات المعلم" };

export default async function AdminEditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [teacher, governorates, cities, subjects] = await Promise.all([
    getTeacherForAdmin(supabase, id),
    getGovernorates(supabase),
    getAllCities(supabase),
    getSubjects(supabase),
  ]);

  if (!teacher) notFound();

  async function action(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
    return adminUpdateTeacherAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">
        تعديل بيانات: {teacher.display_name}
      </h2>
      <Card className="p-5">
        <TeacherProfileForm
          governorates={governorates}
          cities={cities}
          subjects={subjects}
          action={action}
          showPublishToggle
          submitLabel="حفظ التغييرات"
          initialValues={{
            fullName: teacher.display_name,
            governorateId: teacher.governorate_id,
            cityId: teacher.city_id,
            subjectIds: teacher.subjects.map((s) => s.id),
            yearsExperience: teacher.years_experience,
            bio: teacher.bio,
            gradeLevels: teacher.grade_levels,
            teachingMethod: teacher.teaching_method,
            educationSystem: teacher.education_system,
            availableTimes: teacher.available_times,
            phone: teacher.phone ?? "",
            whatsapp: teacher.whatsapp ?? "",
            avatarUrl: teacher.avatar_url,
            isPublished: teacher.is_published,
          }}
        />
      </Card>
    </div>
  );
}
