import { SupportMessagesTable } from "@/components/admin/support-messages-table";
import { EmptyState } from "@/components/ui/feedback";
import { getAllSupportMessagesForAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { LifeBuoy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "رسائل الدعم" };

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const messages = await getAllSupportMessagesForAdmin(supabase);

  if (messages.length === 0) {
    return <EmptyState icon={<LifeBuoy className="size-6" />} title="لا توجد رسائل دعم بعد" />;
  }

  return <SupportMessagesTable messages={messages} />;
}
