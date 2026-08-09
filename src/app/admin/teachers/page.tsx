import { TeachersTable } from "@/components/admin/teachers-table";
import { EmptyState } from "@/components/ui/feedback";
import { getAllTeachersForAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة المعلمين" };

export default async function AdminTeachersPage() {
  const supabase = await createClient();
  const teachers = await getAllTeachersForAdmin(supabase);

  if (teachers.length === 0) {
    return <EmptyState icon={<GraduationCap className="size-6" />} title="لا يوجد معلمون بعد" />;
  }

  return <TeachersTable teachers={teachers} />;
}
