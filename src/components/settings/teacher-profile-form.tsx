"use client";

import type { ActionResult } from "@/actions/auth";
import { Avatar } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/feedback";
import { Checkbox, FieldError, Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { EDUCATION_SYSTEM_OPTIONS, GRADE_LEVELS, TEACHING_METHOD_OPTIONS } from "@/lib/constants";
import type { City, EducationSystem, Governorate, Subject, TeachingMethod } from "@/lib/types/database";
import { Camera } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface TeacherProfileInitialValues {
  fullName: string;
  governorateId: number | null;
  cityId: number | null;
  subjectIds: number[];
  yearsExperience: number;
  bio: string;
  gradeLevels: string[];
  teachingMethod: TeachingMethod;
  educationSystem: EducationSystem | null;
  availableTimes: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string | null;
  isPublished?: boolean;
}

export function TeacherProfileForm({
  governorates,
  cities,
  subjects,
  initialValues,
  action,
  showPublishToggle = false,
  submitLabel,
  pendingLabel = "جارٍ الحفظ...",
  onSuccess,
}: {
  governorates: Governorate[];
  cities: City[];
  subjects: Subject[];
  initialValues: TeacherProfileInitialValues;
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  showPublishToggle?: boolean;
  submitLabel: string;
  pendingLabel?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState(action, {} as ActionResult);
  const [governorateId, setGovernorateId] = useState(String(initialValues.governorateId ?? ""));
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialValues.avatarUrl);
  const [isPublished, setIsPublished] = useState(initialValues.isPublished ?? false);

  const citiesForGovernorate = useMemo(
    () => cities.filter((c) => String(c.governorate_id) === governorateId),
    [cities, governorateId]
  );

  useEffect(() => {
    if (state.success) {
      toast.success("تم حفظ التغييرات بنجاح");
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="space-y-5" encType="multipart/form-data">
      <div className="flex items-center gap-4">
        <label className="group relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ink-300 bg-ink-50 text-ink-400 hover:border-gold-400 dark:border-ink-600 dark:bg-ink-800">
          {avatarPreview ? (
            <Avatar src={avatarPreview} name={initialValues.fullName} size={80} />
          ) : (
            <Camera className="size-6" />
          )}
          <input
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAvatarPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        <div>
          <p className="text-sm font-medium text-ink-800 dark:text-ink-100">الصورة الشخصية</p>
          <p className="text-xs text-ink-500 dark:text-ink-400">مطلوبة قبل ظهور ملفك في نتائج البحث</p>
        </div>
      </div>

      <div>
        <Label htmlFor="fullName">الاسم الكامل</Label>
        <Input id="fullName" name="fullName" defaultValue={initialValues.fullName} required minLength={3} maxLength={100} />
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
          <Select id="cityId" name="cityId" required defaultValue={String(initialValues.cityId ?? "")} disabled={!governorateId}>
            <option value="">اختر المدينة</option>
            {citiesForGovernorate.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>المواد التي تدرّسها</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {subjects.map((s) => (
            <Checkbox
              key={s.id}
              name="subjectIds"
              value={s.id}
              label={s.name}
              defaultChecked={initialValues.subjectIds.includes(s.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>المراحل الدراسية</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GRADE_LEVELS.map((level) => (
            <Checkbox
              key={level}
              name="gradeLevels"
              value={level}
              label={level}
              defaultChecked={initialValues.gradeLevels.includes(level)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="yearsExperience">سنوات الخبرة</Label>
          <Input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={80}
            defaultValue={initialValues.yearsExperience}
            required
          />
        </div>
        <div>
          <Label htmlFor="teachingMethod">طريقة التدريس</Label>
          <Select id="teachingMethod" name="teachingMethod" defaultValue={initialValues.teachingMethod} required>
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
          <Select id="educationSystem" name="educationSystem" defaultValue={initialValues.educationSystem ?? ""}>
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
          <Input id="availableTimes" name="availableTimes" defaultValue={initialValues.availableTimes} placeholder="مثال: يوميًا 4-9 مساءً" />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">نبذة عنك</Label>
        <Textarea id="bio" name="bio" defaultValue={initialValues.bio} required minLength={20} maxLength={1000} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
          <Input id="phone" name="phone" type="tel" dir="ltr" className="text-end" defaultValue={initialValues.phone} />
        </div>
        <div>
          <Label htmlFor="whatsapp">رقم واتساب (اختياري)</Label>
          <Input id="whatsapp" name="whatsapp" type="tel" dir="ltr" className="text-end" defaultValue={initialValues.whatsapp} />
        </div>
      </div>

      {showPublishToggle && (
        <>
          <input type="hidden" name="isPublished" value={isPublished ? "true" : "false"} />
          <Checkbox
            label="ظاهر في نتائج البحث (منشور)"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </>
      )}

      <FieldError>{state.error}</FieldError>

      <SubmitButton pendingText={pendingLabel}>{submitLabel}</SubmitButton>
    </form>
  );
}
