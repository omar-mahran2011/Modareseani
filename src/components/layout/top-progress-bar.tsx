"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A thin top progress bar that appears briefly on every route change, for
 * visual feedback while the next page's data is fetched — the App Router
 * doesn't expose route-change-start/end events directly, so this reacts to
 * pathname+searchParams changing (the moment the new page has committed)
 * and plays a short completion animation, giving a lightweight sense of
 * motion between pages instead of a silent jump-cut.
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), 450);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className={`fixed inset-x-0 top-0 z-50 h-0.5 bg-gold-400 transition-all duration-500 ease-out ${
        visible ? "w-full opacity-100" : "w-0 opacity-0"
      }`}
    />
  );
}
