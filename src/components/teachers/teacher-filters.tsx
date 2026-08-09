"use client";

import { Select } from "@/components/ui/form-fields";
import type { City, Governorate, Subject } from "@/lib/types/database";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export function TeacherFilters({
  governorates,
  cities,
  subjects,
  current,
}: {
  governorates: Governorate[];
  cities: City[];
  subjects: Subject[];
  current: {
    governorateId?: string;
    cityId?: string;
    subjectId?: string;
    minRating?: string;
    sort?: string;
    q?: string;
  };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [governorateId, setGovernorateId] = useState(current.governorateId ?? "");
  const router = useRouter();

  const citiesForGovernorate = useMemo(
    () => cities.filter((c) => String(c.governorate_id) === governorateId),
    [cities, governorateId]
  );

  const hasActiveFilters =
    current.governorateId || current.cityId || current.subjectId || current.minRating || current.q;

  return (
    <form ref={formRef} method="get" className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          name="q"
          defaultValue={current.q}
          placeholder="ابحث بالاسم أو المادة..."
          className="h-12 w-full rounded-xl border border-ink-200 bg-white ps-10 pe-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-gold-400 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Select
          name="governorateId"
          value={governorateId}
          onChange={(e) => {
            setGovernorateId(e.target.value);
            router.push("?" + new URLSearchParams({ governorateId: e.target.value }).toString());
          }}
        >
          <option value="">كل المحافظات</option>
          {governorates.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>

        <Select name="cityId" defaultValue={current.cityId} onChange={() => formRef.current?.requestSubmit()}>
          <option value="">كل المدن</option>
          {citiesForGovernorate.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select name="subjectId" defaultValue={current.subjectId} onChange={() => formRef.current?.requestSubmit()}>
          <option value="">كل المواد</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select name="minRating" defaultValue={current.minRating} onChange={() => formRef.current?.requestSubmit()}>
          <option value="">كل التقييمات</option>
          <option value="4">4 نجوم فأكثر</option>
          <option value="3">3 نجوم فأكثر</option>
          <option value="2">نجمتان فأكثر</option>
        </Select>

        <Select name="sort" defaultValue={current.sort ?? "rating"} onChange={() => formRef.current?.requestSubmit()}>
          <option value="rating">الأعلى تقييمًا</option>
          <option value="experience">الأكثر خبرة</option>
          <option value="newest">الأحدث انضمامًا</option>
        </Select>

        {hasActiveFilters ? (
          <Link
            href="/teachers"
            className="flex h-full items-center justify-center gap-1.5 rounded-lg border border-ink-200 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-600 dark:text-ink-300 dark:hover:bg-ink-700"
          >
            <X className="size-4" /> مسح الفلاتر
          </Link>
        ) : (
          <button
            type="submit"
            className="h-full rounded-lg bg-ink-800 text-sm font-medium text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950"
          >
            بحث
          </button>
        )}
      </div>
    </form>
  );
}
