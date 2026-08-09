import { LinkButton } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300">
        <SearchX className="size-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
        الصفحة غير موجودة
      </h1>
      <p className="text-ink-500 dark:text-ink-400">
        الرابط الذي فتحته غير صحيح أو تم نقل الصفحة.
      </p>
      <LinkButton href="/teachers">العودة إلى دليل المعلمين</LinkButton>
    </div>
  );
}
