"use client";

import { adminCreateCityAction, adminDeleteCityAction, adminUpdateCityAction } from "@/actions/admin";
import { ConfirmButton } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form-fields";
import type { City, Governorate } from "@/lib/types/database";
import { Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function CityManager({ cities, governorates }: { cities: City[]; governorates: Governorate[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterGovernorateId, setFilterGovernorateId] = useState("");
  const [creating, setCreating] = useState(false);

  const governorateName = useMemo(
    () => new Map(governorates.map((g) => [g.id, g.name])),
    [governorates]
  );

  const filteredCities = filterGovernorateId
    ? cities.filter((c) => String(c.governorate_id) === filterGovernorateId)
    : cities;

  async function handleCreate(formData: FormData) {
    setCreating(true);
    const result = await adminCreateCityAction(formData);
    setCreating(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("تمت إضافة المدينة");
      router.refresh();
      (document.getElementById("city-create-form") as HTMLFormElement)?.reset();
    }
  }

  async function handleUpdate(id: number, formData: FormData) {
    const result = await adminUpdateCityAction(id, formData);
    if (result.error) toast.error(result.error);
    else {
      toast.success("تم الحفظ");
      setEditingId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <form
        id="city-create-form"
        action={handleCreate}
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 dark:border-ink-700 dark:bg-ink-800/60"
      >
        <Select name="governorateId" required className="max-w-[200px]">
          <option value="">اختر المحافظة</option>
          {governorates.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
        <Input name="name" placeholder="اسم المدينة الجديدة" required minLength={2} maxLength={100} className="flex-1" />
        <button
          type="submit"
          disabled={creating}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-ink-800 px-4 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60 dark:bg-gold-400 dark:text-ink-950"
        >
          <Plus className="size-4" /> إضافة
        </button>
      </form>

      <Select value={filterGovernorateId} onChange={(e) => setFilterGovernorateId(e.target.value)} className="max-w-xs">
        <option value="">كل المحافظات</option>
        {governorates.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </Select>

      <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 dark:divide-ink-700 dark:border-ink-700">
        {filteredCities.map((city) =>
          editingId === city.id ? (
            <li key={city.id} className="flex flex-wrap items-center gap-2 bg-white p-3 dark:bg-ink-800/60">
              <form
                action={(formData) => handleUpdate(city.id, formData)}
                className="flex flex-1 flex-wrap items-center gap-2"
              >
                <Select name="governorateId" defaultValue={city.governorate_id} required className="max-w-[200px]">
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
                <Input name="name" defaultValue={city.name} required minLength={2} maxLength={100} className="flex-1" autoFocus />
                <SubmitButton>حفظ</SubmitButton>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex size-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
                >
                  <X className="size-4" />
                </button>
              </form>
            </li>
          ) : (
            <li key={city.id} className="flex items-center justify-between bg-white p-3 dark:bg-ink-800/60">
              <span className="text-sm text-ink-800 dark:text-ink-100">
                {city.name} <span className="text-ink-400">— {governorateName.get(city.governorate_id)}</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingId(city.id)}
                  className="flex items-center gap-1 text-sm text-ink-600 hover:underline dark:text-ink-300"
                >
                  <Pencil className="size-3.5" /> تعديل
                </button>
                <ConfirmButton
                  triggerLabel="حذف"
                  triggerClassName="text-sm text-red-600 hover:underline dark:text-red-400"
                  title="حذف المدينة"
                  description="سيؤثر حذف هذه المدينة على المستخدمين والمعلمين المسجلين فيها. هل أنت متأكد؟"
                  confirmLabel="حذف"
                  onConfirm={async () => {
                    const result = await adminDeleteCityAction(city.id);
                    if (!result.error) router.refresh();
                    return result;
                  }}
                />
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
