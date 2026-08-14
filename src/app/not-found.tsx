import { LinkButton } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md animate-fade-in flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="animate-bounce-subtle flex size-16 items-center justify-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300">
        <SearchX className="size-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
        الصفحة غير موجودة
      </h1>
      <p className="text-ink-500 dark:text-ink-400">
        الرابط الذي فتحته غير صحيح أو تم نقل الصفحة.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <LinkButton href="/teachers">العودة إلى Modareseani</LinkButton>
        <LinkButton href="/" variant="outline">
          الصفحة الرئيسية
        </LinkButton>
      </div>
    </div>
  );
}
