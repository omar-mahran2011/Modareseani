import { ReviewForm } from "@/components/teachers/review-form";
import { ReviewList } from "@/components/teachers/review-list";
import { WhatsAppButton } from "@/components/teachers/whatsapp-button";
import { CopyLinkButton } from "@/components/teachers/copy-link-button";
import { Avatar, Badge, Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { RatingBadge, StarRatingDisplay } from "@/components/ui/star-rating";
import {
  EDUCATION_SYSTEM_LABELS,
  TEACHING_METHOD_LABELS,
} from "@/lib/constants";
import {
  getMyRatingForTeacher,
  getMyReviewText,
  getReviewsForTeacher,
  getTeacherById,
} from "@/lib/data/teachers";
import { getAuthContext } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/server";
import { formatExperience, formatRatingsCount } from "@/lib/utils";
import { BookOpen, Clock, GraduationCap, Laptop2, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const teacher = await getTeacherById(supabase, id);
  if (!teacher) return { title: "المعلم غير موجود" };
  return {
    title: teacher.display_name,
    description: teacher.bio.slice(0, 160),
  };
}

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [teacher, auth] = await Promise.all([getTeacherById(supabase, id), getAuthContext()]);

  if (!teacher) notFound();
  if (!teacher.is_published && teacher.profile_id !== auth?.userId && !auth?.isAdmin) notFound();

  const isOwner = auth?.userId === teacher.profile_id;

  const [reviews, myRating, myReviewText] = await Promise.all([
    getReviewsForTeacher(supabase, teacher.profile_id),
    auth && !isOwner ? getMyRatingForTeacher(supabase, teacher.profile_id, auth.userId) : null,
    auth && !isOwner ? getMyReviewText(supabase, teacher.profile_id, auth.userId) : "",
  ]);

  return (
    <div className="mx-auto max-w-4xl animate-fade-in px-4 py-8 sm:px-6">
      <BackButton fallbackHref="/teachers" label="رجوع لدليل المعلمين" className="mb-4" />
      {!teacher.is_published && (
        <div className="mb-4 rounded-xl bg-gold-100 px-4 py-2.5 text-sm text-gold-700 dark:bg-gold-400/10 dark:text-gold-300">
          هذا الملف غير منشور حاليًا ولا يظهر في نتائج البحث العامة.
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <Avatar src={teacher.avatar_url} name={teacher.display_name} size={112} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
                {teacher.display_name}
              </h1>
              <RatingBadge value={teacher.avg_rating} count={teacher.ratings_count} />
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
              <StarRatingDisplay value={teacher.avg_rating} />
              <span>{formatRatingsCount(teacher.ratings_count)}</span>
            </div>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              {[teacher.city_name, teacher.governorate_name].filter(Boolean).join("، ")}
            </p>

            {teacher.subjects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teacher.subjects.map((s) => (
                  <Badge key={s.id} tone="gold">
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {teacher.phone && (
                <a
                  href={`tel:${teacher.phone}`}
                  className="flex h-11 items-center gap-2 rounded-xl border border-ink-200 px-4 text-sm font-medium text-ink-700 hover:bg-ink-50 dark:border-ink-600 dark:text-ink-100 dark:hover:bg-ink-700"
                >
                  <Phone className="size-4" /> {teacher.phone}
                </a>
              )}
              {teacher.whatsapp && (
                <WhatsAppButton number={teacher.whatsapp} teacherName={teacher.display_name} />
              )}
              <CopyLinkButton />
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoStat icon={GraduationCap} label="سنوات الخبرة" value={formatExperience(teacher.years_experience)} />
        <InfoStat
          icon={Laptop2}
          label="طريقة التدريس"
          value={TEACHING_METHOD_LABELS[teacher.teaching_method] ?? teacher.teaching_method}
        />
        <InfoStat
          icon={BookOpen}
          label="النظام التعليمي"
          value={teacher.education_system ? (EDUCATION_SYSTEM_LABELS[teacher.education_system] ?? "غير محدد") : "غير محدد"}
        />
        <InfoStat icon={Clock} label="أوقات التوفر" value={teacher.available_times || "غير محدد"} />
      </div>

      {teacher.bio && (
        <Card className="mt-6 p-5">
          <h2 className="mb-2 font-display text-lg font-semibold text-ink-900 dark:text-white">نبذة عن المعلم</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            {teacher.bio}
          </p>
        </Card>
      )}

      {teacher.grade_levels.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900 dark:text-white">المراحل الدراسية</h2>
          <div className="flex flex-wrap gap-1.5">
            {teacher.grade_levels.map((level) => (
              <Badge key={level}>{level}</Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900 dark:text-white">
          التقييمات والتعليقات
        </h2>

        {isOwner ? null : auth ? (
          <div className="mb-5">
            <ReviewForm
              teacherId={teacher.profile_id}
              initialStars={myRating?.stars ?? 0}
              initialComment={myReviewText}
            />
          </div>
        ) : (
          <Card className="mb-5 p-4 text-center text-sm text-ink-600 dark:text-ink-300">
            <a href="/login" className="font-medium text-ink-800 hover:underline dark:text-gold-300">
              سجّل الدخول
            </a>{" "}
            لإضافة تقييمك لهذا المعلم
          </Card>
        )}

        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}

function InfoStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3.5 dark:border-ink-700 dark:bg-ink-800/60">
      <Icon className="size-4.5 text-gold-500" />
      <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">{label}</p>
      <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{value}</p>
    </div>
  );
}
