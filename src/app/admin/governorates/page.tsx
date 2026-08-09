import {
  adminCreateGovernorateAction,
  adminDeleteGovernorateAction,
  adminUpdateGovernorateAction,
} from "@/actions/admin";
import { LookupManager } from "@/components/admin/lookup-manager";
import { getGovernorates } from "@/lib/data/reference";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة المحافظات" };

export default async function AdminGovernoratesPage() {
  const supabase = await createClient();
  const governorates = await getGovernorates(supabase);

  return (
    <LookupManager
      items={governorates}
      itemLabel="المحافظة"
      deleteWarning="سيؤدي حذف هذه المحافظة إلى حذف كل مدنها المرتبطة بها، وقد يؤثر على المستخدمين المسجلين فيها. هل أنت متأكد؟"
      createAction={adminCreateGovernorateAction}
      updateAction={adminUpdateGovernorateAction}
      deleteAction={adminDeleteGovernorateAction}
    />
  );
}
