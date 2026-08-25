import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getUserDashboardData } from "@/lib/dashboard";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";

export const metadata: Metadata = { title: "Dashboard | GabonConnect" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard");

  const dashboardData = await getUserDashboardData(user.id);
  if (!dashboardData) redirect("/join/profile");

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader data={dashboardData} />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <DashboardTabs data={dashboardData} />
      </div>
    </div>
  );
}
