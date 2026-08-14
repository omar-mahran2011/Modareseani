"use client";

import { Button, LinkButton } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md animate-fade-in flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="animate-wiggle flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">حدث خطأ ما</h1>
      <p className="text-ink-500 dark:text-ink-400">
        تعذر تحميل هذه الصفحة. حاول مرة أخرى، وإذا استمرت المشكلة تواصل معنا.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>إعادة المحاولة</Button>
        <LinkButton href="/teachers" variant="outline">
          الصفحة الرئيسية
        </LinkButton>
      </div>
    </div>
  );
}
