"use client";

import { signUpStudentAction, signUpTeacherAction, type ActionResult } from "@/actions/auth";
import { GoogleAuthButton } from "@/components/auth/google-button";
import { SubmitButton } from "@/components/ui/feedback";
import { Checkbox, FieldError, Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { EDUCATION_SYSTEM_OPTIONS, GRADE_LEVELS, TEACHING_METHOD_OPTIONS } from "@/lib/constants";
import type { City, Governorate, Subject } from "@/lib/types/database";
import { Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  // Honeypot: a hidden field real users never fill. If a bot filled it,
  // silently pretend success instead of creating an account.
  if (String(formData.get("website") ?? "").length > 0) {
    return { success: true };
  }

  const accountType = String(formData.get("accountType") ?? "student");
  if (accountType === "teacher") {
    return signUpTeacherAction(formData);
  }
  return signUpStudentAction({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    governorateId: Number(formData.get("governorateId")),
    cityId: Number(formData.get("cityId")),
  });
}

export function SignupForm({
  governorates,
  cities,
  subjects,
}: {
  governorates: Governorate[];
  cities: City[];
  subjects: Subject[];
}) {
  const [state, action] = useActionState(formAction, initialState);
  const router = useRouter();

  const [accountType, setAccountType] = useState<"student" | "teacher">("student");
  const [governorateId, setGovernorateId] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const citiesForGovernorate = useMemo(
    () => cities.filter((c) => String(c.governorate_id) === governorateId),
    [cities, governorateId]
  );

  useEffect(() => {
    if (state.success) {
      toast.success(
        accountType === "teacher"
          ? "تم إنشاء حسابك! تحقق من بريدك الإلكتروني لتأكيد الحساب إذا طُلب ذلك."
          : "تم إنشاء حسابك بنجاح!"
      );
      router.push("/login");
    }
  }, [state.success, accountType, router]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">إنشاء حساب جديد</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">انضم إلينا كطالب أو كمعلم</p>
      </div>

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

      <GoogleAuthButton label="التسجيل باستخدام جوجل" />
      <div className="flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
        أو بالبريد الإلكتروني
        <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
      </div>

      <form action={action} className="space-y-4" encType="multipart/form-data">
        <input type="hidden" name="accountType" value={accountType} />
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {accountType === "teacher" && (
          <div className="flex flex-col items-center gap-2">
            <label className="group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ink-300 bg-ink-50 text-ink-400 hover:border-gold-400 dark:border-ink-600 dark:bg-ink-800">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="معاينة الصورة الشخصية" className="size-full object-cover" />
              ) : (
                <Camera className="size-7" />
              )}
              <input
                type="file"
                name="avatar"
                accept="image/png,image/jpeg,image/webp"
                required={accountType === "teacher"}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAvatarPreview(URL.createObjectURL(file));
                }}
              />
            </label>
            <span className="text-xs text-ink-500 dark:text-ink-400">الصورة الشخصية (مطلوبة)</span>
          </div>
        )}

        <div>
          <Label htmlFor="fullName">الاسم الكامل</Label>
          <Input id="fullName" name="fullName" required minLength={3} maxLength={100} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" name="email" type="email" required dir="ltr" className="text-end" />
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
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

        {accountType === "teacher" && (
          <>
            <div>
              <Label>المواد التي تدرّسها</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {subjects.map((s) => (
                  <Checkbox key={s.id} name="subjectIds" value={s.id} label={s.name} />
                ))}
              </div>
            </div>

            <div>
              <Label>المراحل الدراسية التي تدرّسها</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GRADE_LEVELS.map((level) => (
                  <Checkbox key={level} name="gradeLevels" value={level} label={level} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="yearsExperience">سنوات الخبرة</Label>
                <Input id="yearsExperience" name="yearsExperience" type="number" min={0} max={80} required />
              </div>
              <div>
                <Label htmlFor="teachingMethod">طريقة التدريس</Label>
                <Select id="teachingMethod" name="teachingMethod" defaultValue="both" required>
                  {TEACHING_METHOD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="educationSystem">النظام التعليمي (اختياري)</Label>
                <Select id="educationSystem" name="educationSystem" defaultValue="">
                  <option value="">غير محدد</option>
                  {EDUCATION_SYSTEM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="availableTimes">أوقات التوفر (اختياري)</Label>
                <Input id="availableTimes" name="availableTimes" placeholder="مثال: يوميًا 4-9 مساءً" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">نبذة عنك</Label>
              <Textarea id="bio" name="bio" required minLength={20} maxLength={1000} placeholder="اكتب نبذة عن خبرتك وأسلوبك في التدريس (20 حرفًا على الأقل)" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                <Input id="phone" name="phone" type="tel" dir="ltr" className="text-end" />
              </div>
              <div>
                <Label htmlFor="whatsapp">رقم واتساب (اختياري)</Label>
                <Input id="whatsapp" name="whatsapp" type="tel" dir="ltr" className="text-end" />
              </div>
            </div>
          </>
        )}

        <FieldError>{state.error}</FieldError>

        <SubmitButton pendingText="جارٍ إنشاء الحساب..." className="w-full">
          إنشاء الحساب
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-medium text-ink-800 hover:underline dark:text-gold-300">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
