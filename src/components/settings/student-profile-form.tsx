"use client";

import { updateStudentProfileAction } from "@/actions/profile";
import type { ActionResult } from "@/actions/auth";
import { Avatar } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/feedback";
import { FieldError, Input, Label, Select } from "@/components/ui/form-fields";
import type { City, Governorate } from "@/lib/types/database";
import { Camera } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return updateStudentProfileAction(formData);
}

export function StudentProfileForm({
  governorates,
  cities,
  initialValues,
}: {
  governorates: Governorate[];
  cities: City[];
  initialValues: {
    fullName: string;
    governorateId: number | null;
    cityId: number | null;
    phone: string;
    avatarUrl: string | null;
  };
}) {
  const [state, action] = useActionState(formAction, initialState);
  const [governorateId, setGovernorateId] = useState(String(initialValues.governorateId ?? ""));
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialValues.avatarUrl);

  const citiesForGovernorate = useMemo(
    () => cities.filter((c) => String(c.governorate_id) === governorateId),
    [cities, governorateId]
  );

  useEffect(() => {
    if (state.success) toast.success("تم حفظ التغييرات بنجاح");
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      <div className="flex items-center gap-4">
        <label className="relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ink-300 bg-ink-50 text-ink-400 hover:border-gold-400 dark:border-ink-600 dark:bg-ink-800">
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
          <p className="text-xs text-ink-500 dark:text-ink-400">اختياري</p>
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
        <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
        <Input id="phone" name="phone" type="tel" dir="ltr" className="text-end" defaultValue={initialValues.phone} />
      </div>

      <FieldError>{state.error}</FieldError>

      <SubmitButton pendingText="جارٍ الحفظ...">حفظ التغييرات</SubmitButton>
    </form>
  );
}
