import { SupportForm } from "@/components/support/support-form";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { getAuthContext } from "@/lib/supabase/auth-context";
import { LifeBuoy } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "الدعم والتواصل" };

export default async function SupportPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/support");

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 py-8 sm:px-6">
      <BackButton className="mb-2" />

      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600 dark:bg-gold-400/10 dark:text-gold-300">
          <LifeBuoy className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">
            الدعم والتواصل
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            عندك مشكلة تقنية أو عايز تبلّغ عن حاجة؟ إحنا هنا نساعدك.
          </p>
        </div>
      </div>

      <Card className="p-5 sm:p-6">
        <SupportForm defaultFullName={auth.profile.full_name} defaultEmail={auth.email} />
      </Card>
    </div>
  );
}
