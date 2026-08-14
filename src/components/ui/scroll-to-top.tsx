"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="animate-scale-in fixed bottom-6 end-6 z-30 flex size-11 items-center justify-center rounded-full bg-ink-900 text-gold-300 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 dark:bg-gold-400 dark:text-ink-950"
      aria-label="العودة لأعلى الصفحة"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
