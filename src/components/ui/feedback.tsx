"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-ink-100 dark:bg-ink-700", className)}
      aria-hidden
    />
  );
}

export function TeacherCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-800/60">
      <div className="flex items-start gap-4">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-4 h-9 w-full rounded-xl" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-800/30">
      {icon && (
        <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300">
          {icon}
        </div>
      )}
      <p className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-ink-500 dark:text-ink-400">{description}</p>
      )}
      {action}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-ink-400", className)} aria-hidden />;
}

export function SubmitButton({
  children,
  pendingText,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();

  const variantClasses = {
    primary: "bg-ink-800 text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950",
    secondary: "bg-gold-400 text-ink-950 hover:bg-gold-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses,
        className
      )}
      {...props}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: {
  currentPage: number;
  totalPages: number;
  /** e.g. "/teachers" */
  basePath: string;
  /** Current filter query params (excluding "page") to preserve across page links. */
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function buildHref(targetPage: number) {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") sp.set(key, value);
    });
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="ترقيم الصفحات">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(
          "flex h-9 min-w-9 items-center justify-center rounded-lg border border-ink-200 px-2 text-sm dark:border-ink-600",
          currentPage === 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-ink-50 dark:hover:bg-ink-700"
        )}
      >
        السابق
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm tabular-nums",
            p === currentPage
              ? "border-ink-800 bg-ink-800 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-ink-950"
              : "border-ink-200 hover:bg-ink-50 dark:border-ink-600 dark:hover:bg-ink-700"
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(
          "flex h-9 min-w-9 items-center justify-center rounded-lg border border-ink-200 px-2 text-sm dark:border-ink-600",
          currentPage === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-ink-50 dark:hover:bg-ink-700"
        )}
      >
        التالي
      </Link>
    </nav>
  );
}
