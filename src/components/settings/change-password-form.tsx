"use client";

import { updatePasswordAction, type ActionResult } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/feedback";
import { FieldError, Input, Label } from "@/components/ui/form-fields";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (password !== confirm) return { error: "كلمتا المرور غير متطابقتين" };
  return updatePasswordAction(password);
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(formAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("تم تحديث كلمة المرور بنجاح");
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="password">كلمة المرور الجديدة</Label>
          <Input id="password" name="password" type="password" required minLength={6} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
        </div>
      </div>
      <FieldError>{state.error}</FieldError>
      <SubmitButton pendingText="جارٍ الحفظ...">تحديث كلمة المرور</SubmitButton>
    </form>
  );
}
