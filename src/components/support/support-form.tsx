"use client";

import { submitSupportMessageAction } from "@/actions/support";
import type { ActionResult } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/feedback";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { SUPPORT_CATEGORY_OPTIONS } from "@/lib/constants";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return submitSupportMessageAction(formData);
}

export function SupportForm({
  defaultFullName,
  defaultEmail,
}: {
  defaultFullName: string;
  defaultEmail: string;
}) {
  const [state, action] = useActionState(formAction, initialState);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (state.success) {
      setSubmitted(true);
      toast.success("تم إرسال رسالتك بنجاح");
    }
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  if (submitted) {
    return (
      <div className="animate-scale-in rounded-2xl border border-gold-200 bg-gold-50 p-6 text-center dark:border-gold-400/30 dark:bg-gold-400/10">
        <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">
          تم استلام رسالتك 🎉
        </p>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          سيراجعها فريق الدعم في أقرب وقت. شكرًا لتواصلك معنا.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-medium text-ink-800 hover:underline dark:text-gold-300"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot: hidden from real users via CSS, bots that fill every field trip it */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fullName">الاسم الكامل</Label>
          <Input id="fullName" name="fullName" defaultValue={defaultFullName} required minLength={2} maxLength={100} />
        </div>
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            required
            dir="ltr"
            className="text-end"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">نوع الرسالة</Label>
        <Select id="category" name="category" defaultValue="technical" required>
          {SUPPORT_CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="message">رسالتك</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          placeholder="اكتب تفاصيل المشكلة أو استفسارك هنا..."
          className="min-h-40"
        />
        <FieldError>{state.error}</FieldError>
      </div>

      <SubmitButton pendingText="جارٍ الإرسال..." className="w-full">
        إرسال الرسالة
      </SubmitButton>
    </form>
  );
}
