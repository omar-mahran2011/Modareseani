import { MessageCircle } from "lucide-react";

/**
 * Normalizes a teacher-entered phone number into the international format
 * WhatsApp's wa.me links require (country code, no leading zero, no
 * symbols). Without this, a locally-entered Egyptian number like
 * "01012345678" fails to resolve to a specific contact, and WhatsApp falls
 * back to its generic "forward to a contact" picker instead of opening a
 * chat with the teacher directly.
 */
function toWhatsAppLink(number: string) {
  let digits = number.replace(/[^\d]/g, "");

  if (digits.startsWith("0")) {
    // Local Egyptian format (e.g. 01012345678) -> international (2010...)
    digits = `20${digits.slice(1)}`;
  } else if (!digits.startsWith("20") && digits.length === 10) {
    // Missing leading zero and country code (e.g. 1012345678)
    digits = `20${digits}`;
  }

  return `https://wa.me/${digits}`;
}

export function WhatsAppButton({ number, teacherName }: { number: string; teacherName: string }) {
  const href = `${toWhatsAppLink(number)}?text=${encodeURIComponent(
    `مرحبًا ${teacherName}، شاهدت ملفك على Modareseani وأود الاستفسار عن الدروس الخصوصية.`
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-md active:scale-95"
    >
      <MessageCircle className="size-4.5" />
      تواصل عبر واتساب
    </a>
  );
}
