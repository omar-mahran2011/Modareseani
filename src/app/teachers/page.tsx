import { TeacherCard } from "@/components/teachers/teacher-card";
import { TeacherFilters } from "@/components/teachers/teacher-filters";
import { EmptyState, Pagination } from "@/components/ui/feedback";
import { getAllCities, getGovernorates, getSubjects } from "@/lib/data/reference";
import { getTeachers } from "@/lib/data/teachers";
import { getAuthContext } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/server";
import { Users2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "دليل المعلمين" };

const PAGE_SIZE = 12;

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const auth = await getAuthContext();
  const supabase = await createClient();

  const hasAnyLocationParam = params.governorateId !== undefined || params.cityId !== undefined;
  const governorateId = params.governorateId
    ? Number(params.governorateId)
    : !hasAnyLocationParam
      ? (auth?.profile.governorate_id ?? undefined)
      : undefined;
  const cityId = params.cityId
    ? Number(params.cityId)
    : !hasAnyLocationParam
      ? (auth?.profile.city_id ?? undefined)
      : undefined;

  const page = Math.max(1, Number(params.page) || 1);

  const [governorates, cities, subjects] = await Promise.all([
    getGovernorates(supabase),
    getAllCities(supabase),
    getSubjects(supabase),
  ]);

  const { teachers, total } = await getTeachers(
    supabase,
    {
      governorateId,
      cityId,
      subjectId: params.subjectId ? Number(params.subjectId) : undefined,
      minRating: params.minRating ? Number(params.minRating) : undefined,
      query: params.q,
      sort: (params.sort as "rating" | "experience" | "newest") ?? "rating",
    },
    { page, pageSize: PAGE_SIZE }
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentGovernorateName = governorateId
    ? governorates.find((g) => g.id === governorateId)?.name
    : undefined;
  const currentCityName = cityId ? cities.find((c) => c.id === cityId)?.name : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl dark:text-white">
          دليل المعلمين
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          {currentCityName || currentGovernorateName
            ? `تصفح المعلمين في ${[currentCityName, currentGovernorateName].filter(Boolean).join("، ")}`
            : "تصفح المعلمين وابحث حسب المادة والمحافظة والمدينة"}
        </p>
      </div>

      <div className="mb-6">
        <TeacherFilters
          governorates={governorates}
          cities={cities}
          subjects={subjects}
          current={{
            governorateId: governorateId ? String(governorateId) : "",
            cityId: cityId ? String(cityId) : "",
            subjectId: params.subjectId,
            minRating: params.minRating,
            sort: params.sort,
            q: params.q,
          }}
        />
      </div>

      {teachers.length === 0 ? (
        <EmptyState
          icon={<Users2 className="size-6" />}
          title="لا يوجد معلمون مطابقون"
          description="جرّب توسيع نطاق البحث أو تغيير الفلاتر المستخدمة."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
            {total} {total === 1 ? "معلم" : "معلمًا"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.profile_id} teacher={teacher} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} basePath="/teachers" searchParams={params} />
          </div>
        </>
      )}
    </div>
  );
}
