export const GRADE_LEVELS = [
  "روضة",
  "الصف الأول الابتدائي",
  "الصف الثاني الابتدائي",
  "الصف الثالث الابتدائي",
  "الصف الرابع الابتدائي",
  "الصف الخامس الابتدائي",
  "الصف السادس الابتدائي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
  "جامعي",
] as const;

export const TEACHING_METHOD_LABELS: Record<string, string> = {
  online: "أونلاين",
  offline: "حضوري",
  both: "أونلاين وحضوري",
};

export const TEACHING_METHOD_OPTIONS = [
  { value: "online", label: "أونلاين" },
  { value: "offline", label: "حضوري" },
  { value: "both", label: "أونلاين وحضوري" },
] as const;

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  student: "طالب / ولي أمر",
  teacher: "معلم",
};

export const EDUCATION_SYSTEM_LABELS: Record<string, string> = {
  national: "المنهج المصري (عام)",
  azhari: "أزهري",
  american: "أمريكي",
  british: "بريطاني (IG)",
  ib: "بكالوريا دولية (IB)",
  stem: "مدارس STEM",
  other: "نظام آخر",
};

export const EDUCATION_SYSTEM_OPTIONS = [
  { value: "national", label: "المنهج المصري (عام)" },
  { value: "azhari", label: "أزهري" },
  { value: "american", label: "أمريكي" },
  { value: "british", label: "بريطاني (IG)" },
  { value: "ib", label: "بكالوريا دولية (IB)" },
  { value: "stem", label: "مدارس STEM" },
  { value: "other", label: "نظام آخر" },
] as const;

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const SITE_NAME = "دليل المعلمين";
