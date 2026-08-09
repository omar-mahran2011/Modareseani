"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

export function StarRatingDisplay({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fillPercent =
          rounded >= i ? 100 : rounded >= i - 0.5 ? 50 : 0;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-ink-200 dark:text-ink-600" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star size={size} className="text-gold-400" fill="currentColor" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="التقييم من 1 إلى 5 نجوم">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} نجوم`}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          className="rounded-lg p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={display >= i ? "text-gold-400" : "text-ink-200 dark:text-ink-600"}
            fill={display >= i ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

/** A compact rating "badge": circular number + star, used on cards/headers. */
export function RatingBadge({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-ink-800 px-2.5 py-1 text-white dark:bg-gold-400 dark:text-ink-950">
      <Star size={14} fill="currentColor" className="text-gold-400 dark:text-ink-950" />
      <span className="text-sm font-semibold tabular-nums">
        {count > 0 ? value.toFixed(1) : "جديد"}
      </span>
    </div>
  );
}
