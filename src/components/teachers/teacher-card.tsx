import { Avatar } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { RatingBadge } from "@/components/ui/star-rating";
import { formatExperience, formatRatingsCount } from "@/lib/utils";
import type { TeacherWithProfile } from "@/lib/types/database";
import { MapPin } from "lucide-react";
import Link from "next/link";

export function TeacherCard({ teacher }: { teacher: TeacherWithProfile }) {
  return (
    <Link
      href={`/teachers/${teacher.profile_id}`}
      className="group relative flex flex-col rounded-2xl border border-ink-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl hover:shadow-ink-900/5 dark:border-ink-700 dark:bg-ink-800/60 dark:hover:border-gold-400/40"
    >
      <div className="flex items-start gap-3.5">
        <Avatar src={teacher.avatar_url} name={teacher.display_name} size={64} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-ink-900 dark:text-white">
            {teacher.display_name}
          </h3>
          {teacher.subjects.length > 0 && (
            <p className="truncate text-sm text-ink-500 dark:text-ink-400">
              {teacher.subjects.map((s) => s.name).join(" · ")}
            </p>
          )}
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-400 dark:text-ink-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {teacher.city_name ?? ""}
              {teacher.governorate_name ? `، ${teacher.governorate_name}` : ""}
            </span>
          </div>
        </div>
        <RatingBadge value={teacher.avg_rating} count={teacher.ratings_count} />
      </div>

      {teacher.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-ink-600 dark:text-ink-300">{teacher.bio}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="gold">{formatExperience(teacher.years_experience)}</Badge>
        <Badge tone="neutral">{formatRatingsCount(teacher.ratings_count)}</Badge>
      </div>

      <span className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-ink-50 text-sm font-medium text-ink-800 transition-colors group-hover:bg-ink-800 group-hover:text-white dark:bg-ink-700 dark:text-ink-100 dark:group-hover:bg-gold-400 dark:group-hover:text-ink-950">
        عرض الملف الشخصي
      </span>
    </Link>
  );
}
