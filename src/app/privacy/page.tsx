import { SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "سياسة الخصوصية والشروط" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
        سياسة الخصوصية والشروط والأحكام
      </h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        آخر تحديث: {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose prose-sm dark:prose-invert mt-8 max-w-none space-y-6 text-ink-700 dark:text-ink-200">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            1. من نحن
          </h2>
          <p className="mt-2 leading-relaxed">
            {SITE_NAME} منصة تساعد الطلاب وأولياء الأمور على إيجاد معلمين خصوصيين في
            محافظتهم ومدينتهم، وتتيح للمعلمين إنشاء ملفات شخصية عامة تظهر في نتائج البحث.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            2. البيانات التي نجمعها
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
            <li>الاسم الكامل والبريد الإلكتروني عند إنشاء الحساب</li>
            <li>المحافظة والمدينة لعرض النتائج القريبة منك</li>
            <li>رقم الهاتف/واتساب (اختياري، للمعلمين والطلاب الراغبين في مشاركته)</li>
            <li>الصورة الشخصية (مطلوبة للمعلمين لظهور ملفهم في البحث)</li>
            <li>التقييمات والمراجعات التي تكتبها</li>
            <li>أي رسالة ترسلها عبر صفحة الدعم والتواصل</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            3. كيف نستخدم بياناتك
          </h2>
          <p className="mt-2 leading-relaxed">
            نستخدم بياناتك فقط لتشغيل المنصة: عرض ملفات المعلمين المناسبة لمنطقتك، تمكينك
            من التواصل مع المعلمين، حساب متوسط التقييمات، والرد على استفساراتك عبر صفحة
            الدعم. لا نبيع بياناتك لأي طرف ثالث، ولا نستخدمها في إعلانات مستهدفة.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            4. من يرى بياناتك
          </h2>
          <p className="mt-2 leading-relaxed">
            الاسم والصورة والمحافظة/المدينة الخاصة بملف المعلم المنشور تظهر علنًا لأي مستخدم
            مسجّل دخول. بريدك الإلكتروني الشخصي لا يظهر لأي مستخدم آخر أبدًا، ولا يُستخدم
            إلا لتسجيل الدخول والتواصل الإداري الضروري.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            5. تخزين البيانات
          </h2>
          <p className="mt-2 leading-relaxed">
            تُخزَّن بياناتك عبر مزوّد خدمة قواعد بيانات (Supabase) الذي يعمل كمعالج بيانات
            نيابة عنا، مع تفعيل قواعد أمان على مستوى كل صف بيانات لمنع أي وصول غير مصرح به.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            6. حقوقك
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
            <li>يمكنك تعديل بياناتك في أي وقت من صفحة الإعدادات</li>
            <li>يمكنك حذف تقييمك الخاص بأي معلم في أي وقت</li>
            <li>
              لطلب حذف حسابك بالكامل، تواصل معنا عبر{" "}
              <a href="/support" className="font-medium text-ink-800 hover:underline dark:text-gold-300">
                صفحة الدعم والتواصل
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            7. قواعد الاستخدام
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
            <li>يُمنع إنشاء ملفات وهمية أو انتحال شخصية معلم آخر</li>
            <li>التقييمات يجب أن تكون بناءً على تجربة حقيقية فقط</li>
            <li>يحتفظ فريق الإدارة بحق حذف أي ملف أو تقييم مخالف دون إشعار مسبق</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            8. تواصل معنا
          </h2>
          <p className="mt-2 leading-relaxed">
            لأي استفسار بخصوص خصوصيتك أو بياناتك، تواصل معنا عبر{" "}
            <a href="/support" className="font-medium text-ink-800 hover:underline dark:text-gold-300">
              صفحة الدعم والتواصل
            </a>
            .
          </p>
        </section>

        <p className="text-xs text-ink-400 dark:text-ink-500">
          هذه الصفحة تقدَّم كدليل عام وليست استشارة قانونية. إذا كانت منصتك تخضع
          لمتطلبات قانونية محددة في بلدك، يُنصح بمراجعتها مع مختص قانوني.
        </p>
      </div>
    </div>
  );
}
