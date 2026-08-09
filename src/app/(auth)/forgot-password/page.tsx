"use client";

import { requestPasswordResetAction, type ActionResult } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/feedback";
import { FieldError, Input, Label } from "@/components/ui/form-fields";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return requestPasswordResetAction(String(formData.get("email") ?? ""));
}

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(formAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور");
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">نسيت كلمة المرور؟</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
        </p>
      </div>

      {state.success ? (
        <div className="rounded-xl bg-teal-50 p-4 text-center text-sm text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
          تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين.
        </div>
      ) : (
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" name="email" type="email" required dir="ltr" className="text-end" />
            <FieldError>{state.error}</FieldError>
          </div>
          <SubmitButton pendingText="جارٍ الإرسال..." className="w-full">
            إرسال رابط إعادة التعيين
          </SubmitButton>
        </form>
      )}

      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        تذكرت كلمة المرور؟{" "}
        <Link href="/login" className="font-medium text-ink-800 hover:underline dark:text-gold-300">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
