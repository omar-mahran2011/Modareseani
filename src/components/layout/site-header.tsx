"use client";

import { logoutAction } from "@/actions/auth";
import { Avatar } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GraduationCap, LayoutDashboard, LifeBuoy, LogOut, Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export interface HeaderUser {
  fullName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        pathname === href || pathname.startsWith(`${href}/`)
          ? "bg-ink-800 text-white dark:bg-gold-400 dark:text-ink-950"
          : "text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
      )}
    >
      {label}
    </Link>
  );

  async function handleLogout() {
    setMenuOpen(false);
    await logoutAction();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur dark:border-ink-700 dark:bg-ink-900/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/teachers" className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white">
          <span className="flex size-9 items-center justify-center rounded-xl bg-ink-800 text-gold-300 dark:bg-gold-400 dark:text-ink-950">
            <GraduationCap className="size-5" />
          </span>
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLink("/teachers", "Modareseani")}
          {user?.isAdmin && navLink("/admin", "لوحة التحكم")}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-100 py-1 ps-1 pe-3 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800"
              >
                <Avatar src={user.avatarUrl} name={user.fullName} size={32} />
                <span className="text-sm font-medium text-ink-800 dark:text-ink-100">
                  {user.fullName.split(" ")[0]}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute end-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-lg dark:border-ink-700 dark:bg-ink-800">
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700"
                    >
                      <Settings className="size-4" /> الإعدادات
                    </Link>
                    <Link
                      href="/support"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700"
                    >
                      <LifeBuoy className="size-4" /> الدعم والتواصل
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700"
                      >
                        <LayoutDashboard className="size-4" /> لوحة التحكم
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="size-4" /> تسجيل الخروج
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-ink-800 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 dark:bg-gold-400 dark:text-ink-950 dark:hover:bg-gold-300"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className="flex size-10 items-center justify-center rounded-lg text-ink-700 transition-transform active:scale-90 dark:text-ink-100"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="القائمة"
          >
            <span className="relative flex size-6 items-center justify-center">
              <Menu
                className={`absolute size-6 transition-all duration-300 ${mobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
              />
              <X
                className={`absolute size-6 transition-all duration-300 ${mobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
              />
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-ink-100 px-4 py-3 md:hidden dark:border-ink-700">
          <nav className="flex flex-col gap-1">
            {navLink("/teachers", "Modareseani")}
            {user?.isAdmin && navLink("/admin", "لوحة التحكم")}
            {user ? (
              <>
                {navLink("/settings", "الإعدادات")}
                {navLink("/support", "الدعم والتواصل")}
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-start text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                {navLink("/login", "تسجيل الدخول")}
                {navLink("/signup", "إنشاء حساب")}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
