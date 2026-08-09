import { ReviewsTable } from "@/components/admin/reviews-table";
import { EmptyState } from "@/components/ui/feedback";
import { getAllReviewsForAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إدارة التقييمات" };

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const reviews = await getAllReviewsForAdmin(supabase);

  if (reviews.length === 0) {
    return <EmptyState icon={MessageSquare} title="لا توجد تقييمات بعد" />;
  }

  return <ReviewsTable reviews={reviews} />;
}
