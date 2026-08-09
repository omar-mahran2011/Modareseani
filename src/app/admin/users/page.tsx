import { Avatar, Badge } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { getAllUsersForAdmin } from "@/lib/data/admin";
import { formatRelativeArabicDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة المستخدمين" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const users = await getAllUsersForAdmin(supabase);

  if (users.length === 0) {
    return <EmptyState icon={Users} title="لا يوجد مستخدمون بعد" />;
  }

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-700">
      <table className="w-full min-w-[800px] text-sm">
        <thead className="bg-ink-50 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
          <tr>
            <th className="p-3 text-start font-medium">المستخدم</th>
            <th className="p-3 text-start font-medium">البريد الإلكتروني</th>
            <th className="p-3 text-start font-medium">النوع</th>
            <th className="p-3 text-start font-medium">الموقع</th>
            <th className="p-3 text-start font-medium">تاريخ الانضمام</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={u.avatar_url} name={u.full_name} size={32} />
                  <span className="font-medium text-ink-800 dark:text-ink-100">{u.full_name}</span>
                </div>
              </td>
              <td className="p-3 text-ink-600 dark:text-ink-300" dir="ltr">
                {u.email}
              </td>
              <td className="p-3">
                <Badge tone={u.account_type === "teacher" ? "gold" : "neutral"}>
                  {ACCOUNT_TYPE_LABELS[u.account_type]}
                </Badge>
              </td>
              <td className="p-3 text-ink-600 dark:text-ink-300">
                {[u.city_name, u.governorate_name].filter(Boolean).join("، ") || "—"}
              </td>
              <td className="p-3 text-ink-500 dark:text-ink-400">
                {formatRelativeArabicDate(u.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
