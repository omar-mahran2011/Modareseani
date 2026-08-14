"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyLinkButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("تم نسخ رابط الملف الشخصي");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذر نسخ الرابط");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "flex h-11 items-center gap-2 rounded-xl border border-ink-200 px-4 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50 active:scale-95 dark:border-ink-600 dark:text-ink-100 dark:hover:bg-ink-700"
      }
    >
      {copied ? <Check className="size-4 text-gold-500" /> : <Share2 className="size-4" />}
      {copied ? "تم النسخ" : "مشاركة الملف"}
    </button>
  );
}
