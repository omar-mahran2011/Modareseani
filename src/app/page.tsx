import { getAuthContext } from "@/lib/supabase/auth-context";
import { LinkButton } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { GraduationCap, MapPin, ShieldCheck, Star } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const auth = await getAuthContext();

  if (auth) {
    if (!auth.profile.governorate_id || !auth.profile.city_id) redirect("/onboarding");
    redirect("/teachers");
  }

  const features = [
    {
      icon: MapPin,
      title: "معلمون في منطقتك",
      description: "ابحث عن معلمين خصوصيين بالقرب منك حسب المحافظة والمدينة.",
    },
    {
      icon: Star,
      title: "تقييمات حقيقية",
      description: "قيّم وتقييمات من طلاب وأولياء أمور حقيقيين، لا محتوى وهمي.",
    },
    {
      icon: ShieldCheck,
      title: "ملفات موثوقة",
      description: "كل معلم يستكمل بياناته وصورته الشخصية قبل ظهوره في نتائج البحث.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-ink-800 text-gold-300 dark:bg-gold-400 dark:text-ink-950">
          <GraduationCap className="size-8" />
        </span>
        <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl dark:text-white">
          {SITE_NAME}
        </h1>
        <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">
          منصة تساعد الطلاب وأولياء الأمور على إيجاد أفضل المعلمين الخصوصيين
          في محافظتهم ومدينتهم، مع تقييمات ومراجعات حقيقية.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/signup" size="lg">
            إنشاء حساب مجاني
          </LinkButton>
          <LinkButton href="/login" variant="outline" size="lg">
            تسجيل الدخول
          </LinkButton>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-ink-100 bg-white p-5 text-center dark:border-ink-700 dark:bg-ink-800/60"
          >
            <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600 dark:bg-gold-400/10 dark:text-gold-300">
              <f.icon className="size-5" />
            </span>
            <h2 className="mt-3 font-display text-base font-semibold text-ink-900 dark:text-white">
              {f.title}
            </h2>
            <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-ink-100 bg-white p-6 text-center sm:p-8 dark:border-ink-700 dark:bg-ink-800/60">
        <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">
          هل أنت معلم؟
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
          أنشئ ملفك الشخصي مجانًا واظهر أمام آلاف الطلاب وأولياء الأمور الباحثين
          عن معلمين في منطقتك.
        </p>
        <LinkButton href="/signup" className="mt-5">
          سجّل كمعلم الآن
        </LinkButton>
      </div>
    </div>
  );
}
