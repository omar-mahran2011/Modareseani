"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/teachers", label: "المعلمون" },
  { href: "/admin/users", label: "المستخدمون" },
  { href: "/admin/reviews", label: "التقييمات" },
  { href: "/admin/support", label: "رسائل الدعم" },
  { href: "/admin/governorates", label: "المحافظات" },
  { href: "/admin/cities", label: "المدن" },
  { href: "/admin/subjects", label: "المواد" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-ink-100 pb-px dark:border-ink-700">
      {TABS.map((tab) => {
        const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-gold-400 text-ink-900 dark:text-white"
                : "border-transparent text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
