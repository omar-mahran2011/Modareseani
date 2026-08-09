import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});
export type LoginInput = z.infer<typeof loginSchema>;

const sharedSignupFields = {
  fullName: z
    .string()
    .trim()
    .min(3, "الاسم الكامل مطلوب (3 أحرف على الأقل)")
    .max(100, "الاسم طويل جدًا"),
  email: z.string().trim().min(1, "البريد الإلكتروني مطلوب").email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(72),
  governorateId: z.coerce.number({ message: "اختر المحافظة" }).int().positive("اختر المحافظة"),
  cityId: z.coerce.number({ message: "اختر المدينة" }).int().positive("اختر المدينة"),
};

export const studentSignupSchema = z.object({
  accountType: z.literal("student"),
  ...sharedSignupFields,
});

const educationSystemValues = [
  "national",
  "azhari",
  "american",
  "british",
  "ib",
  "stem",
  "other",
] as const;

export const teacherSignupSchema = z.object({
  accountType: z.literal("teacher"),
  ...sharedSignupFields,
  subjectIds: z.array(z.coerce.number().int().positive()).min(1, "اختر مادة واحدة على الأقل"),
  yearsExperience: z.coerce
    .number({ message: "أدخل عدد سنوات الخبرة" })
    .int()
    .min(0, "لا يمكن أن يكون سالبًا")
    .max(80, "قيمة غير منطقية"),
  bio: z
    .string()
    .trim()
    .min(20, "الوصف يجب أن يكون 20 حرفًا على الأقل")
    .max(1000, "الوصف طويل جدًا (1000 حرف كحد أقصى)"),
  gradeLevels: z.array(z.string()).min(1, "اختر مرحلة دراسية واحدة على الأقل"),
  teachingMethod: z.enum(["online", "offline", "both"]),
  educationSystem: z.enum(educationSystemValues).optional(),
  availableTimes: z.string().trim().max(300).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
});

export const signupSchema = z.discriminatedUnion("accountType", [
  studentSignupSchema,
  teacherSignupSchema,
]);
export type SignupInput = z.infer<typeof signupSchema>;

export const teacherProfileSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل مطلوب").max(100),
  governorateId: z.coerce.number().int().positive("اختر المحافظة"),
  cityId: z.coerce.number().int().positive("اختر المدينة"),
  subjectIds: z.array(z.coerce.number().int().positive()).min(1, "اختر مادة واحدة على الأقل"),
  yearsExperience: z.coerce.number().int().min(0).max(80),
  bio: z.string().trim().min(20, "الوصف يجب أن يكون 20 حرفًا على الأقل").max(1000),
  gradeLevels: z.array(z.string()).min(1, "اختر مرحلة دراسية واحدة على الأقل"),
  teachingMethod: z.enum(["online", "offline", "both"]),
  educationSystem: z.enum(educationSystemValues).optional(),
  availableTimes: z.string().trim().max(300).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  avatarUrl: z.string().trim().max(500).optional().or(z.literal("")),
});
export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>;

export const studentProfileSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم الكامل مطلوب").max(100),
  governorateId: z.coerce.number().int().positive("اختر المحافظة"),
  cityId: z.coerce.number().int().positive("اختر المدينة"),
  avatarUrl: z.string().trim().max(500).optional().or(z.literal("")),
});
export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

export const reviewSchema = z.object({
  teacherId: z.string().uuid(),
  stars: z.coerce.number().int().min(1, "اختر تقييمًا من 1 إلى 5").max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const referenceItemSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
});

export const citySchema = z.object({
  governorateId: z.coerce.number().int().positive("اختر المحافظة"),
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
});
