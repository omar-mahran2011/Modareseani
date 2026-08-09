"use client";

import type { ActionResult } from "@/actions/auth";
import { ConfirmButton } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form-fields";
import { Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface LookupItem {
  id: number;
  name: string;
}

export function LookupManager({
  items,
  itemLabel,
  deleteWarning,
  createAction,
  updateAction,
  deleteAction,
}: {
  items: LookupItem[];
  itemLabel: string;
  deleteWarning: string;
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (id: number, formData: FormData) => Promise<ActionResult>;
  deleteAction: (id: number) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate(formData: FormData) {
    setCreating(true);
    const result = await createAction(formData);
    setCreating(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`تمت إضافة ${itemLabel}`);
      router.refresh();
      (document.getElementById("lookup-create-form") as HTMLFormElement)?.reset();
    }
  }

  async function handleUpdate(id: number, formData: FormData) {
    const result = await updateAction(id, formData);
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
        id="lookup-create-form"
        action={handleCreate}
        className="flex items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 dark:border-ink-700 dark:bg-ink-800/60"
      >
        <Input name="name" placeholder={`اسم ${itemLabel} الجديدة`} required minLength={2} maxLength={100} />
        <button
          type="submit"
          disabled={creating}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-ink-800 px-4 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60 dark:bg-gold-400 dark:text-ink-950"
        >
          <Plus className="size-4" /> إضافة
        </button>
      </form>

      <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 dark:divide-ink-700 dark:border-ink-700">
        {items.map((item) =>
          editingId === item.id ? (
            <li key={item.id} className="flex items-center gap-2 bg-white p-3 dark:bg-ink-800/60">
              <form
                action={(formData) => handleUpdate(item.id, formData)}
                className="flex flex-1 items-center gap-2"
              >
                <Input name="name" defaultValue={item.name} required minLength={2} maxLength={100} autoFocus />
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
            <li key={item.id} className="flex items-center justify-between bg-white p-3 dark:bg-ink-800/60">
              <span className="text-sm text-ink-800 dark:text-ink-100">{item.name}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="flex items-center gap-1 text-sm text-ink-600 hover:underline dark:text-ink-300"
                >
                  <Pencil className="size-3.5" /> تعديل
                </button>
                <ConfirmButton
                  triggerLabel="حذف"
                  triggerClassName="text-sm text-red-600 hover:underline dark:text-red-400"
                  title={`حذف ${itemLabel}`}
                  description={deleteWarning}
                  confirmLabel="حذف"
                  onConfirm={async () => {
                    const result = await deleteAction(item.id);
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
