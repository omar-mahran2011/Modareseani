"use client";

import { deleteMyRatingAction, submitRatingAction } from "@/actions/ratings";
import type { ActionResult } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/form-fields";
import { StarRatingInput } from "@/components/ui/star-rating";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const initialState: ActionResult = {};

export function ReviewForm({
  teacherId,
  initialStars,
  initialComment,
}: {
  teacherId: string;
  initialStars: number;
  initialComment: string;
}) {
  const [stars, setStars] = useState(initialStars);
  const [isDeleting, startDeleteTransition] = useTransition();

  async function formAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    return submitRatingAction({
      teacherId,
      stars,
      comment: String(formData.get("comment") ?? ""),
    });
  }

  const [state, action] = useActionState(formAction, initialState);

  useEffect(() => {
    if (state.success) toast.success(initialStars ? "تم تحديث تقييمك" : "شكرًا لتقييمك!");
  }, [state.success, initialStars]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteMyRatingAction(teacherId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("تم حذف تقييمك");
        setStars(0);
      }
    });
  }

  return (
    <form action={action} className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-800/60">
      <p className="mb-2 text-sm font-medium text-ink-800 dark:text-ink-100">
        {initialStars ? "تعديل تقييمك" : "أضف تقييمك"}
      </p>
      <StarRatingInput value={stars} onChange={setStars} />
      <Textarea
        name="comment"
        defaultValue={initialComment}
        placeholder="اكتب تعليقًا عن تجربتك (اختياري)"
        className="mt-3"
        maxLength={1000}
      />
      <div className="mt-3 flex items-center gap-2">
        <SubmitButton pendingText="جارٍ الحفظ..." disabled={stars === 0}>
          {initialStars ? "تحديث التقييم" : "إرسال التقييم"}
        </SubmitButton>
        {initialStars > 0 && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
          >
            حذف التقييم
          </button>
        )}
      </div>
    </form>
  );
}
