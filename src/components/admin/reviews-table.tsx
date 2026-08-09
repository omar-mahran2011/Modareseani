"use client";

import { adminDeleteReviewAction } from "@/actions/admin";
import { ConfirmButton } from "@/components/ui/dialog";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { formatRelativeArabicDate } from "@/lib/utils";
import type { AdminReviewRow } from "@/lib/types/database";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ReviewsTable({ reviews }: { reviews: AdminReviewRow[] }) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-800/60">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                بواسطة <span className="font-medium text-ink-800 dark:text-ink-100">{r.author_name || "مستخدم"}</span>{" "}
                على ملف{" "}
                <Link href={`/teachers/${r.teacher_id}`} className="font-medium text-ink-800 hover:underline dark:text-gold-300">
                  {r.teacher_name}
                </Link>
              </p>
              <StarRatingDisplay value={r.stars} size={14} className="mt-1.5" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-400">{formatRelativeArabicDate(r.created_at)}</span>
              <ConfirmButton
                triggerLabel="حذف"
                triggerClassName="text-red-600 hover:underline dark:text-red-400"
                title="حذف التقييم"
                description="هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء."
                confirmLabel="حذف"
                onConfirm={async () => {
                  const result = await adminDeleteReviewAction(r.id, r.teacher_id);
                  if (!result.error) router.refresh();
                  return result;
                }}
              />
            </div>
          </div>
          {r.comment && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-300">{r.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
