"use client";

import { adminDeleteTeacherAction, adminSetTeacherPublishedAction } from "@/actions/admin";
import { Avatar, Badge } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/dialog";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import type { AdminTeacherRow } from "@/lib/types/database";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function TeachersTable({ teachers }: { teachers: AdminTeacherRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function togglePublished(teacherId: string, next: boolean) {
    setPendingId(teacherId);
    startTransition(async () => {
      const result = await adminSetTeacherPublishedAction(teacherId, next);
      setPendingId(null);
      if (result.error) toast.error(result.error);
      else {
        toast.success(next ? "تم نشر الملف" : "تم إلغاء نشر الملف");
        router.refresh();
      }
    });
  }

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-700">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-ink-50 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
          <tr>
            <th className="p-3 text-start font-medium">المعلم</th>
            <th className="p-3 text-start font-medium">البريد الإلكتروني</th>
            <th className="p-3 text-start font-medium">الموقع</th>
            <th className="p-3 text-start font-medium">التقييم</th>
            <th className="p-3 text-start font-medium">الحالة</th>
            <th className="p-3 text-start font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
          {teachers.map((t) => (
            <tr key={t.profile_id}>
              <td className="p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={t.avatar_url} name={t.display_name} size={36} />
                  <div>
                    <p className="font-medium text-ink-800 dark:text-ink-100">{t.display_name}</p>
                    <p className="text-xs text-ink-400">{t.subjects.map((s) => s.name).join("، ") || "—"}</p>
                  </div>
                </div>
              </td>
              <td className="p-3 text-ink-600 dark:text-ink-300" dir="ltr">
                {t.email}
              </td>
              <td className="p-3 text-ink-600 dark:text-ink-300">
                {[t.city_name, t.governorate_name].filter(Boolean).join("، ") || "—"}
              </td>
              <td className="p-3">
                <StarRatingDisplay value={t.avg_rating} size={13} />
              </td>
              <td className="p-3">
                <button
                  onClick={() => togglePublished(t.profile_id, !t.is_published)}
                  disabled={pendingId === t.profile_id}
                  className="disabled:opacity-50"
                >
                  <Badge tone={t.is_published ? "teal" : "neutral"}>
                    {t.is_published ? "منشور" : "غير منشور"}
                  </Badge>
                </button>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/teachers/${t.profile_id}`}
                    className="flex items-center gap-1 text-ink-600 hover:underline dark:text-ink-300"
                  >
                    <Pencil className="size-3.5" /> تعديل
                  </Link>
                  <ConfirmButton
                    triggerLabel="حذف"
                    triggerClassName="text-red-600 hover:underline dark:text-red-400"
                    title="حذف حساب المعلم"
                    description={`هل أنت متأكد من حذف "${t.display_name}"؟ سيتم حذف الحساب وكل بياناته نهائيًا.`}
                    confirmLabel="حذف نهائي"
                    onConfirm={async () => {
                      const result = await adminDeleteTeacherAction(t.profile_id);
                      if (!result.error) router.refresh();
                      return result;
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
