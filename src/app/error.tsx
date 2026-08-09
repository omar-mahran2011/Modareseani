"use client";

import { Button } from "@/components/ui/button";
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
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">حدث خطأ ما</h1>
      <p className="text-ink-500 dark:text-ink-400">
        تعذر تحميل هذه الصفحة. حاول مرة أخرى، وإذا استمرت المشكلة تواصل معنا.
      </p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </div>
  );
}
