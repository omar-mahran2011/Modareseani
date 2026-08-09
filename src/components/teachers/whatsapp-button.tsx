import { MessageCircle } from "lucide-react";

function toWhatsAppLink(number: string) {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

export function WhatsAppButton({ number, teacherName }: { number: string; teacherName: string }) {
  const href = `${toWhatsAppLink(number)}?text=${encodeURIComponent(
    `مرحبًا ${teacherName}، شاهدت ملفك على دليل المعلمين وأود الاستفسار عن الدروس الخصوصية.`
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-600"
    >
      <MessageCircle className="size-4.5" />
      تواصل عبر واتساب
    </a>
  );
}
