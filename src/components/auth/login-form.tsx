"use client";

import { loginAction, type ActionResult } from "@/actions/auth";
import { GoogleAuthButton } from "@/components/auth/google-button";
import { FieldError, Input, Label } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/feedback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return loginAction({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(formAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push(next && next.startsWith("/") ? next : "/teachers");
      router.refresh();
    }
  }, [state.success, next, router]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          سعداء بعودتك! سجّل الدخول للمتابعة.
        </p>
      </div>

      <GoogleAuthButton />

      <div className="flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
        أو بالبريد الإلكتروني
        <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
      </div>

      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" dir="ltr" className="text-end" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">كلمة المرور</Label>
            <Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-ink-500 hover:text-gold-500 dark:text-ink-400">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
          <FieldError>{state.error}</FieldError>
        </div>
        <SubmitButton pendingText="جارٍ الدخول..." className="w-full">
          تسجيل الدخول
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        ليس لديك حساب؟{" "}
        <Link href="/signup" className="font-medium text-ink-800 hover:underline dark:text-gold-300">
          إنشاء حساب جديد
        </Link>
      </p>
    </div>
  );
}
