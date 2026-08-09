import { Avatar } from "@/components/ui/card";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { formatRelativeArabicDate } from "@/lib/utils";
import type { ReviewWithAuthor } from "@/lib/types/database";
import { MessageCircleOff } from "lucide-react";

export function ReviewList({ reviews }: { reviews: ReviewWithAuthor[] }) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-200 py-10 text-center dark:border-ink-700">
        <MessageCircleOff className="size-6 text-ink-300 dark:text-ink-600" />
        <p className="text-sm text-ink-500 dark:text-ink-400">لا توجد تعليقات مكتوبة بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-800/60">
          <Avatar src={review.author_avatar_url} name={review.author_name || "مستخدم"} size={40} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="font-medium text-ink-800 dark:text-ink-100">
                {review.author_name || "مستخدم"}
              </span>
              <span className="text-xs text-ink-400 dark:text-ink-500">
                {formatRelativeArabicDate(review.created_at)}
              </span>
            </div>
            <StarRatingDisplay value={review.stars} size={14} className="mt-1" />
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-300">
              {review.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
