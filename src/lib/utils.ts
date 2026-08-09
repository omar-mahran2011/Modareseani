import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return `${parts[0]![0]}${parts[1]![0]}`;
}

export function formatRelativeArabicDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "اليوم";
  if (diffDays === 1) return "منذ يوم";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "منذ أسبوع" : `منذ ${weeks} أسابيع`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "منذ شهر" : `منذ ${months} أشهر`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? "منذ سنة" : `منذ ${years} سنوات`;
}

export function formatExperience(years: number): string {
  if (years === 0) return "أقل من سنة خبرة";
  if (years === 1) return "سنة خبرة";
  if (years === 2) return "سنتان خبرة";
  if (years >= 3 && years <= 10) return `${years} سنوات خبرة`;
  return `${years} سنة خبرة`;
}

export function formatRatingsCount(count: number): string {
  if (count === 0) return "لا يوجد تقييمات بعد";
  if (count === 1) return "تقييم واحد";
  if (count === 2) return "تقييمان";
  if (count >= 3 && count <= 10) return `${count} تقييمات`;
  return `${count} تقييم`;
}
