"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supportMessageSchema } from "@/lib/validations/schemas";
import { SUPPORT_CATEGORY_LABELS } from "@/lib/constants";
import type { ActionResult } from "@/actions/auth";
import type { SupportStatus } from "@/lib/types/database";

/**
 * Best-effort email notification to the admin when a new support message
 * arrives. Requires RESEND_API_KEY + ADMIN_NOTIFICATION_EMAIL env vars
 * (see README) — silently no-ops if either is missing, so the core feature
 * (message gets saved, visible in /admin/support) never depends on this.
 */
async function notifyAdminOfNewMessage(input: {
  fullName: string;
  email: string;
  category: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Modareseani <onboarding@resend.dev>",
        to,
        subject: `رسالة دعم جديدة: ${SUPPORT_CATEGORY_LABELS[input.category] ?? input.category}`,
        html: `
          <div dir="rtl" style="font-family: sans-serif;">
            <p><strong>من:</strong> ${input.fullName} (${input.email})</p>
            <p><strong>النوع:</strong> ${SUPPORT_CATEGORY_LABELS[input.category] ?? input.category}</p>
            <p><strong>الرسالة:</strong></p>
            <p style="white-space: pre-wrap;">${input.message}</p>
          </div>
        `,
      }),
    });
  } catch {
    // Never let a notification failure affect the actual submission.
  }
}

export async function submitSupportMessageAction(formData: FormData): Promise<ActionResult> {
  // Honeypot: a hidden field real users never see or fill. Any value here
  // means a bot filled every input on the page, so silently pretend success
  // without touching the database.
  if (String(formData.get("website") ?? "").length > 0) {
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول لإرسال رسالة" };

  // Basic rate limit: block after 5 messages in the last hour per user.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("support_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);
  if ((recentCount ?? 0) >= 5) {
    return { error: "لقد أرسلت عدة رسائل مؤخرًا. حاول مرة أخرى بعد قليل." };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    category: String(formData.get("category") ?? "other"),
    relatedTeacherId: String(formData.get("relatedTeacherId") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = supportMessageSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const { error } = await supabase.from("support_messages").insert({
    user_id: user.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    category: parsed.data.category,
    related_teacher_id: parsed.data.relatedTeacherId || null,
    message: parsed.data.message,
  });

  if (error) return { error: error.message };

  await notifyAdminOfNewMessage({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    category: parsed.data.category,
    message: parsed.data.message,
  });

  return { success: true };
}

async function requireAdminForSupport() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "غير مصرح لك بهذا الإجراء" as const };

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) return { supabase, error: "غير مصرح لك بهذا الإجراء" as const };
  return { supabase, error: null };
}

export async function adminUpdateSupportMessageStatusAction(
  messageId: number,
  status: SupportStatus
): Promise<ActionResult> {
  const { supabase, error } = await requireAdminForSupport();
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("support_messages")
    .update({ status })
    .eq("id", messageId);
  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/support");
  return { success: true };
}

export async function adminDeleteSupportMessageAction(messageId: number): Promise<ActionResult> {
  const { supabase, error } = await requireAdminForSupport();
  if (error) return { error };

  const { error: deleteError } = await supabase.from("support_messages").delete().eq("id", messageId);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin/support");
  return { success: true };
}
