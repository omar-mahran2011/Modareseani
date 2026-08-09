import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 py-8 dark:border-ink-700">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-ink-400 sm:px-6 dark:text-ink-500">
        © {new Date().getFullYear()} {SITE_NAME} — منصة للتواصل بين الطلاب وأولياء الأمور والمعلمين في مصر.
      </div>
    </footer>
  );
}
