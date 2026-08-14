import { getAuthContext } from "@/lib/supabase/auth-context";
import { getAdminStats } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const stats = await getAdminStats(supabase);

  const features = [
    {
      icon: MapPin,
      title: "معلمون في منطقتك",
      description: "ابحث عن معلمين خصوصيين بالقرب منك حسب المحافظة والمدينة.",
    },
    {
      icon: Star,
      title: "تقييمات حقيقية",
      description: "تقييمات ومراجعات من طلاب وأولياء أمور حقيقيين، لا محتوى وهمي.",
    },
    {
      icon: ShieldCheck,
      title: "ملفات موثوقة",
      description: "كل معلم يستكمل بياناته وصورته الشخصية قبل ظهوره في نتائج البحث.",
    },
  ];

  const stripStats = [
    { value: stats.publishedTeachers, label: "معلم منشور" },
    { value: 27, label: "محافظة مصرية" },
    { value: stats.totalReviews, label: "تقييم حقيقي" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-ink-100 bg-ink-900 dark:border-ink-800">
        {/* Decorative gradient mesh */}
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute -end-32 -top-32 size-[28rem] rounded-full bg-gold-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -start-40 top-1/2 size-[24rem] -translate-y-1/2 rounded-full bg-ink-500/10 blur-3xl"
        />
        {/* Faint ruled-notebook lines, evoking a class register */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #ECBE5B 0, #ECBE5B 1px, transparent 1px, transparent 48px)",
          }}
        />

        <div className="relative mx-auto max-w-5xl animate-slide-up px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="mx-auto mb-6 flex size-16 animate-bounce-subtle items-center justify-center rounded-2xl bg-gold-400 text-ink-950 shadow-lg shadow-gold-400/20">
            <GraduationCap className="size-8" />
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {SITE_NAME}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-200">
            منصة تساعد الطلاب وأولياء الأمور على إيجاد أفضل المعلمين الخصوصيين
            في محافظتهم ومدينتهم، مع تقييمات ومراجعات حقيقية.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/signup" size="lg" className="shadow-lg shadow-gold-400/10 hover:-translate-y-0.5">
              إنشاء حساب مجاني
            </LinkButton>
            <LinkButton
              href="/login"
              size="lg"
              className="border border-white/15 bg-white/5 text-white hover:-translate-y-0.5 hover:bg-white/10"
            >
              تسجيل الدخول
            </LinkButton>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {stripStats.map((s, i) => (
              <div key={s.label} className="animate-slide-up" style={{ animationDelay: `${i * 100 + 200}ms` }}>
                <p className="font-display text-2xl font-bold text-gold-300 sm:text-3xl">{s.value}+</p>
                <p className="mt-1 text-xs text-ink-300 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="hover-lift animate-slide-up group rounded-2xl border border-ink-100 bg-white p-5 text-center hover:shadow-lg dark:border-ink-700 dark:bg-ink-800/60"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600 transition-all duration-300 group-hover:rotate-6 group-hover:bg-gold-400 group-hover:text-ink-950 dark:bg-gold-400/10 dark:text-gold-300">
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-3 font-display text-base font-semibold text-ink-900 dark:text-white">
                {f.title}
              </h2>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-ink-800 to-ink-900 p-6 text-center shadow-sm sm:p-10 dark:border-ink-700">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">هل أنت معلم؟</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-200 sm:text-base">
            أنشئ ملفك الشخصي مجانًا واظهر أمام آلاف الطلاب وأولياء الأمور الباحثين
            عن معلمين في منطقتك.
          </p>
          <LinkButton href="/signup" size="lg" className="mt-6 hover:-translate-y-0.5">
            سجّل كمعلم الآن
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
