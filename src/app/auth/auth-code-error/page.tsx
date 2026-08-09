import { LinkButton } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
        تعذر تسجيل الدخول
      </h1>
      <p className="text-ink-500 dark:text-ink-400">
        الرابط منتهي الصلاحية أو غير صحيح. حاول تسجيل الدخول مرة أخرى.
      </p>
      <LinkButton href="/login">العودة إلى تسجيل الدخول</LinkButton>
    </div>
  );
}
