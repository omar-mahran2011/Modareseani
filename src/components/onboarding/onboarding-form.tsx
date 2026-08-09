"use client";

import { completeOnboardingAction } from "@/actions/profile";
import type { ActionResult } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/feedback";
import { FieldError, Input, Label, Select } from "@/components/ui/form-fields";
import type { City, Governorate } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return completeOnboardingAction(formData);
}

export function OnboardingForm({
  defaultFullName,
  governorates,
  cities,
}: {
  defaultFullName: string;
  governorates: Governorate[];
  cities: City[];
}) {
  const [state, action] = useActionState(formAction, initialState);
  const [accountType, setAccountType] = useState<"student" | "teacher">("student");
  const [governorateId, setGovernorateId] = useState("");
  const router = useRouter();

  const citiesForGovernorate = useMemo(
    () => cities.filter((c) => String(c.governorate_id) === governorateId),
    [cities, governorateId]
  );

  useEffect(() => {
    if (state.success) {
      if (accountType === "teacher") {
        toast.success("خطوة أخيرة: أكمل بيانات ملفك كمعلم من الإعدادات");
        router.push("/settings");
      } else {
        toast.success("تم إعداد حسابك بنجاح!");
        router.push("/teachers");
      }
      router.refresh();
    }
  }, [state.success, accountType, router]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={action} className="space-y-5">
      <div>
        <Label>نوع الحساب</Label>
        <input type="hidden" name="accountType" value={accountType} />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAccountType("student")}
            className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
              accountType === "student"
                ? "border-ink-800 bg-ink-800 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-ink-950"
                : "border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-600 dark:text-ink-300"
            }`}
          >
            طالب / ولي أمر
          </button>
          <button
            type="button"
            onClick={() => setAccountType("teacher")}
            className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
              accountType === "teacher"
                ? "border-ink-800 bg-ink-800 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-ink-950"
                : "border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-600 dark:text-ink-300"
            }`}
          >
            معلم
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="fullName">الاسم الكامل</Label>
        <Input id="fullName" name="fullName" defaultValue={defaultFullName} required minLength={3} maxLength={100} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="governorateId">المحافظة</Label>
          <Select
            id="governorateId"
            name="governorateId"
            required
            value={governorateId}
            onChange={(e) => setGovernorateId(e.target.value)}
          >
            <option value="">اختر المحافظة</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="cityId">المدينة</Label>
          <Select id="cityId" name="cityId" required disabled={!governorateId}>
            <option value="">اختر المدينة</option>
            {citiesForGovernorate.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <FieldError>{state.error}</FieldError>

      <SubmitButton pendingText="جارٍ الحفظ..." className="w-full">
        متابعة
      </SubmitButton>
    </form>
  );
}
