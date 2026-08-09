"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations/schemas";
import type { ActionResult } from "@/actions/auth";

export async function submitRatingAction(input: {
  teacherId: string;
  stars: number;
  comment: string;
}): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول لإضافة تقييم" };

  if (user.id === parsed.data.teacherId) {
    return { error: "لا يمكنك تقييم نفسك" };
  }

  const { data: rating, error: ratingError } = await supabase
    .from("ratings")
    .upsert(
      { teacher_id: parsed.data.teacherId, user_id: user.id, stars: parsed.data.stars },
      { onConflict: "teacher_id,user_id" }
    )
    .select("id")
    .single();

  if (ratingError) return { error: ratingError.message };

  const comment = parsed.data.comment?.trim() ?? "";

  if (comment) {
    const { error: reviewError } = await supabase
      .from("reviews")
      .upsert(
        { rating_id: rating.id, teacher_id: parsed.data.teacherId, user_id: user.id, comment },
        { onConflict: "rating_id" }
      );
    if (reviewError) return { error: reviewError.message };
  } else {
    await supabase.from("reviews").delete().eq("rating_id", rating.id);
  }

  revalidatePath(`/teachers/${parsed.data.teacherId}`);
  return { success: true };
}

export async function deleteMyRatingAction(teacherId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("teacher_id", teacherId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath(`/teachers/${teacherId}`);
  return { success: true };
}
