import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-100 bg-white shadow-sm dark:border-ink-700 dark:bg-ink-800/60",
        className
      )}
      {...props}
    />
  );
}

type BadgeTone = "neutral" | "gold" | "teal" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100",
  gold: "bg-gold-100 text-gold-700 dark:bg-gold-400/20 dark:text-gold-300",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({
  src,
  name,
  size = 48,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-ink-700 font-display font-semibold text-gold-300",
        className
      )}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
