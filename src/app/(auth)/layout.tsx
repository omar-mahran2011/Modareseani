import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { BackButton } from "@/components/ui/back-button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-paper px-4 py-10 dark:bg-transparent">
      {/* Decorative floating gold blobs, matching the landing page style */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-gold-300/20 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -start-24 bottom-0 size-72 rounded-full bg-ink-400/10 blur-3xl"
      />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-4">
          <BackButton fallbackHref="/" />
        </div>
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-bold text-ink-900 transition-transform duration-300 hover:scale-105 dark:text-white"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-gold-300 transition-transform duration-300 hover:rotate-6 dark:bg-gold-400 dark:text-ink-950">
            <GraduationCap className="size-6" />
          </span>
          {SITE_NAME}
        </Link>
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8 dark:border-ink-700 dark:bg-ink-800/60">
          {children}
        </div>
      </div>
    </div>
  );
}
