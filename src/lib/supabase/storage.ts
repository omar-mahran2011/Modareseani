import type { SupabaseClient } from "@supabase/supabase-js";
import { ACCEPTED_IMAGE_TYPES, MAX_AVATAR_SIZE_BYTES } from "@/lib/constants";

/**
 * Uploads a profile/teacher photo to the "avatars" bucket under
 * "{userId}/avatar-{timestamp}.{ext}" and returns its public URL.
 * Returns null (no-op) when no file was provided, so callers can treat a
 * missing file as "keep the existing photo".
 */
export async function uploadAvatarIfPresent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  file: File | null | undefined
): Promise<{ url: string | null; error: string | null }> {
  if (!file || file.size === 0) {
    return { url: null, error: null };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { url: null, error: "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP." };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { url: null, error: "حجم الصورة كبير جدًا. الحد الأقصى 5 ميجابايت." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });

  if (uploadError) {
    return { url: null, error: `تعذر رفع الصورة: ${uploadError.message}` };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
