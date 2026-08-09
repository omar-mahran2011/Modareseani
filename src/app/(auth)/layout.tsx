import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-paper px-4 py-10 dark:bg-transparent">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-bold text-ink-900 dark:text-white">
          <span className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-gold-300 dark:bg-gold-400 dark:text-ink-950">
            <GraduationCap className="size-6" />
          </span>
          {SITE_NAME}
        </Link>
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8 dark:border-ink-700 dark:bg-ink-800/60">
          {children}
        </div>
      </div>
    </div>
  );
}
