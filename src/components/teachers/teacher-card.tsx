import { Avatar } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { RatingBadge } from "@/components/ui/star-rating";
import { FounderBadge } from "@/components/teachers/founder-badge";
import { formatExperience, formatRatingsCount } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TeacherWithProfile } from "@/lib/types/database";
import { MapPin } from "lucide-react";
import Link from "next/link";

export function TeacherCard({ teacher }: { teacher: TeacherWithProfile }) {
  const founder = teacher.is_founder;

  return (
    <Link
      href={`/teachers/${teacher.profile_id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink-900/5",
        founder
          ? "border-gold-300 bg-gradient-to-b from-gold-50 to-white dark:border-gold-400/50 dark:from-gold-400/10 dark:to-ink-800/60"
          : "border-ink-100 bg-white hover:border-gold-300 dark:border-ink-700 dark:bg-ink-800/60 dark:hover:border-gold-400/40"
      )}
    >
      {founder && (
        <div className="absolute -end-10 top-3 rotate-45 bg-gold-400 px-10 py-0.5 text-[10px] font-bold text-ink-950 shadow-sm">
          مؤسس
        </div>
      )}

      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          <Avatar
            src={teacher.avatar_url}
            name={teacher.display_name}
            size={64}
            className={founder ? "ring-2 ring-gold-400 ring-offset-2 ring-offset-white dark:ring-offset-ink-900" : ""}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate font-display text-base font-semibold text-ink-900 dark:text-white">
              {teacher.display_name}
            </h3>
          </div>
          {founder && (
            <div className="mt-1">
              <FounderBadge size="sm" />
            </div>
          )}
          {teacher.subjects.length > 0 && (
            <p className="mt-1 truncate text-sm text-ink-500 dark:text-ink-400">
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

      <span
        className={cn(
          "mt-4 flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium transition-colors",
          founder
            ? "bg-gold-400 text-ink-950 group-hover:bg-gold-300"
            : "bg-ink-50 text-ink-800 group-hover:bg-ink-800 group-hover:text-white dark:bg-ink-700 dark:text-ink-100 dark:group-hover:bg-gold-400 dark:group-hover:text-ink-950"
        )}
      >
        عرض الملف الشخصي
      </span>
    </Link>
  );
}
