import { SITE_NAME } from "@/lib/constants";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 py-8 dark:border-ink-700">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="/support"
            className="font-medium text-ink-600 transition-colors hover:text-gold-500 dark:text-ink-300 dark:hover:text-gold-400"
          >
            الدعم والتواصل
          </Link>
          <Link
            href="/privacy"
            className="font-medium text-ink-600 transition-colors hover:text-gold-500 dark:text-ink-300 dark:hover:text-gold-400"
          >
            سياسة الخصوصية والشروط
          </Link>
        </div>
        <p className="text-ink-400 dark:text-ink-500">
          © {new Date().getFullYear()} {SITE_NAME} — منصة للتواصل بين الطلاب وأولياء الأمور والمعلمين في مصر.
        </p>
      </div>
    </footer>
  );
}
