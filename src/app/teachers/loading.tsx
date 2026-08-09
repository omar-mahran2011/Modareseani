import { TeacherCardSkeleton } from "@/components/ui/feedback";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 h-16 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-700" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TeacherCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
