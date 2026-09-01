import { redirect } from "next/navigation";
import { GreAnalyticsDashboard } from "@/components/admin/gre-analytics-dashboard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GreAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin/analytics");
  return <GreAnalyticsDashboard />;
}