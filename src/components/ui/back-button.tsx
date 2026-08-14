"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Goes back using the browser's real navigation history (router.back()),
 * which is what makes the destination page restore at the exact scroll
 * position the user left it at — that restoration is native browser/Next.js
 * behavior for history navigation, not something simulated here.
 *
 * Falls back to a fixed destination when there's no in-app history to go
 * back to (e.g. someone opened this page directly from a shared link).
 */
export function BackButton({
  fallbackHref = "/teachers",
  label = "رجوع",
  className,
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory((window.history.state?.idx ?? 0) > 0);
  }, []);

  return (
    <button
      type="button"
      onClick={() => (hasHistory ? router.back() : router.push(fallbackHref))}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-600 transition-all duration-200 hover:-translate-x-1 hover:bg-ink-100 hover:text-ink-900 active:scale-95 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white",
        className
      )}
    >
      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      {label}
    </button>
  );
}
