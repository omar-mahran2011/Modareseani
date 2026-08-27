"use client";

import { adminDeleteSupportMessageAction, adminUpdateSupportMessageStatusAction } from "@/actions/support";
import { Badge } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/dialog";
import { SUPPORT_CATEGORY_LABELS } from "@/lib/constants";
import { formatRelativeArabicDate } from "@/lib/utils";
import type { SupportMessage } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function SupportMessagesTable({ messages }: { messages: SupportMessage[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function toggleStatus(id: number, next: "open" | "resolved") {
    startTransition(async () => {
      const result = await adminUpdateSupportMessageStatusAction(id, next);
      if (result.error) toast.error(result.error);
      else {
        toast.success(next === "resolved" ? "تم وضع علامة كمنتهية" : "تم إعادة فتح الرسالة");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-2xl border p-4 transition-opacity ${
            m.status === "resolved"
              ? "border-ink-100 bg-ink-50/50 opacity-70 dark:border-ink-700 dark:bg-ink-800/30"
              : "border-gold-200 bg-white dark:border-gold-400/30 dark:bg-ink-800/60"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink-800 dark:text-ink-100">{m.full_name}</span>
                <span className="text-xs text-ink-400" dir="ltr">
                  {m.email}
                </span>
                <Badge tone="gold">{SUPPORT_CATEGORY_LABELS[m.category] ?? m.category}</Badge>
                <Badge tone={m.status === "open" ? "teal" : "neutral"}>
                  {m.status === "open" ? "مفتوحة" : "منتهية"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-400">{formatRelativeArabicDate(m.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStatus(m.id, m.status === "open" ? "resolved" : "open")}
                className="text-sm font-medium text-ink-600 hover:underline dark:text-ink-300"
              >
                {m.status === "open" ? "وضع كمنتهية" : "إعادة فتح"}
              </button>
              <ConfirmButton
                triggerLabel="حذف"
                triggerClassName="text-sm text-red-600 hover:underline dark:text-red-400"
                title="حذف الرسالة"
                description="هل أنت متأكد من حذف هذه الرسالة نهائيًا؟"
                confirmLabel="حذف"
                onConfirm={async () => {
                  const result = await adminDeleteSupportMessageAction(m.id);
                  if (!result.error) router.refresh();
                  return result;
                }}
              />
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-300">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
