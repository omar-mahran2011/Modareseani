import { getTeachers } from "@/lib/data/teachers";
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/teachers
 *
 * Read-only teacher search, backed by the same RLS-protected query used by
 * the directory page. Requires an authenticated session (the `teachers`
 * table's SELECT policy is scoped `to authenticated`, matching the product
 * requirement that browsing happens after login) — Supabase enforces this
 * regardless, but we check first to return a clean 401 instead of an empty
 * result set.
 *
 * Query params: governorateId, cityId, subjectId, minRating, minExperience,
 * q, sort ("rating" | "experience" | "newest"), page, pageSize (max 50).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول للوصول إلى هذه البيانات" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const toNumber = (key: string) => {
    const value = searchParams.get(key);
    return value ? Number(value) : undefined;
  };

  const page = Math.max(1, toNumber("page") ?? 1);
  const pageSize = Math.min(50, Math.max(1, toNumber("pageSize") ?? 12));
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "experience" || sortParam === "newest" ? sortParam : "rating";

  try {
    const { teachers, total } = await getTeachers(
      supabase,
      {
        governorateId: toNumber("governorateId"),
        cityId: toNumber("cityId"),
        subjectId: toNumber("subjectId"),
        minRating: toNumber("minRating"),
        minExperience: toNumber("minExperience"),
        query: searchParams.get("q") ?? undefined,
        sort,
      },
      { page, pageSize }
    );

    return NextResponse.json({ teachers, total, page, pageSize });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
