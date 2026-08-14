import { getAuthContext } from "@/lib/supabase/auth-context";
import { LinkButton } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  if (!auth.isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          هذه الصفحة للمشرفين فقط
        </h1>
        <p className="text-ink-500 dark:text-ink-400">لا تملك صلاحية الوصول إلى لوحة التحكم.</p>
        <LinkButton href="/teachers">العودة إلى Modareseani</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink-900 dark:text-white">
        لوحة التحكم
      </h1>
      <AdminNav />
      <div className="mt-6 animate-fade-in">{children}</div>
    </div>
  );
}
