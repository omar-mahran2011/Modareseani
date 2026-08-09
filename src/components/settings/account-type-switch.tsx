"use client";

import { switchAccountTypeAction } from "@/actions/profile";
import { Badge } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/dialog";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import type { AccountType } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AccountTypeSwitch({ currentType }: { currentType: AccountType }) {
  const router = useRouter();
  const targetType: AccountType = currentType === "student" ? "teacher" : "student";

  async function handleConfirm() {
    const result = await switchAccountTypeAction(targetType);
    if (result.error) {
      toast.error(result.error);
      return result;
    }
    toast.success(
      targetType === "teacher"
        ? "تم التحويل إلى حساب معلم. أكمل بياناتك أدناه ليظهر ملفك في البحث."
        : "تم التحويل إلى حساب طالب. تم إخفاء ملفك كمعلم من نتائج البحث مع الاحتفاظ ببياناته."
    );
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-800/60">
      <div>
        <p className="text-sm font-medium text-ink-800 dark:text-ink-100">نوع الحساب الحالي</p>
        <Badge tone="gold" className="mt-1">
          {ACCOUNT_TYPE_LABELS[currentType]}
        </Badge>
      </div>
      <ConfirmButton
        triggerLabel={`التحويل إلى ${ACCOUNT_TYPE_LABELS[targetType]}`}
        triggerClassName="rounded-xl border border-ink-200 px-4 py-2.5 text-ink-700 hover:bg-ink-50 dark:border-ink-600 dark:text-ink-100 dark:hover:bg-ink-700"
        title="تأكيد تغيير نوع الحساب"
        description={
          targetType === "teacher"
            ? "سيتم تحويل حسابك إلى حساب معلم. بياناتك المشتركة (الاسم، الصورة، المحافظة، المدينة) ستبقى كما هي، وستحتاج لإكمال بيانات ملفك كمعلم قبل ظهوره في نتائج البحث."
            : "سيتم تحويل حسابك إلى حساب طالب. سيتم إخفاء ملفك كمعلم من نتائج البحث، لكن بياناته ستبقى محفوظة في حال رغبت بالعودة لاحقًا."
        }
        confirmLabel="تأكيد التحويل"
        variant="primary"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
