"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="size-9" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-full text-ink-500 transition-all duration-300 hover:rotate-12 hover:bg-ink-100 active:scale-90 dark:text-ink-200 dark:hover:bg-ink-700"
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
    >
      <span className="animate-scale-in" key={isDark ? "sun" : "moon"}>
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </span>
    </button>
  );
}
