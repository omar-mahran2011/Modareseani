import { adminCreateSubjectAction, adminDeleteSubjectAction, adminUpdateSubjectAction } from "@/actions/admin";
import { LookupManager } from "@/components/admin/lookup-manager";
import { getSubjects } from "@/lib/data/reference";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة المواد" };

export default async function AdminSubjectsPage() {
  const supabase = await createClient();
  const subjects = await getSubjects(supabase);

  return (
    <LookupManager
      items={subjects}
      itemLabel="المادة"
      deleteWarning="سيؤدي حذف هذه المادة إلى إزالتها من كل ملفات المعلمين المرتبطين بها. هل أنت متأكد؟"
      createAction={adminCreateSubjectAction}
      updateAction={adminUpdateSubjectAction}
      deleteAction={adminDeleteSubjectAction}
    />
  );
}
