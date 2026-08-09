"use client";

import { updatePasswordAction, type ActionResult } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/feedback";
import { FieldError, Input, Label } from "@/components/ui/form-fields";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (password !== confirm) return { error: "كلمتا المرور غير متطابقتين" };
  return updatePasswordAction(password);
}

export default function ResetPasswordPage() {
  const [state, action] = useActionState(formAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success("تم تحديث كلمة المرور بنجاح");
      router.push("/teachers");
    }
  }, [state.success, router]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">تعيين كلمة مرور جديدة</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">اختر كلمة مرور قوية لحسابك.</p>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="password">كلمة المرور الجديدة</Label>
          <Input id="password" name="password" type="password" required minLength={6} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
          <FieldError>{state.error}</FieldError>
        </div>
        <SubmitButton pendingText="جارٍ الحفظ..." className="w-full">
          حفظ كلمة المرور
        </SubmitButton>
      </form>
    </div>
  );
}
