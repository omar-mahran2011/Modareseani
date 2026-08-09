import { Card } from "@/components/ui/card";
import { getAdminStats } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, CheckCircle2, GraduationCap, MessageSquare, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "لوحة التحكم" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const stats = await getAdminStats(supabase);

  const cards = [
    { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users },
    { label: "الطلاب وأولياء الأمور", value: stats.totalStudents, icon: BookOpen },
    { label: "إجمالي المعلمين", value: stats.totalTeachers, icon: GraduationCap },
    { label: "المعلمون المنشورون", value: stats.publishedTeachers, icon: CheckCircle2 },
    { label: "إجمالي التقييمات", value: stats.totalReviews, icon: MessageSquare },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <card.icon className="size-5 text-gold-500" />
          <p className="mt-3 font-display text-2xl font-bold text-ink-900 dark:text-white">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{card.label}</p>
        </Card>
      ))}
    </div>
  );
}
