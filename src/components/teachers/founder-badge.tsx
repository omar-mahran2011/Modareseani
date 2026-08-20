import { Crown } from "lucide-react";

export function FounderBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const isSmall = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-gold-400 to-gold-300 font-semibold text-ink-950 shadow-sm ${
        isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Crown className={isSmall ? "size-3" : "size-3.5"} fill="currentColor" />
      عضو مؤسس
    </span>
  );
}
