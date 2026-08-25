import type { UserDashboardData } from "@/lib/dashboard";
import Link from "next/link";
import { useMessages } from "@/components/i18n-provider";

interface DashboardOverviewProps {
  data: UserDashboardData;
}

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  const messages = useMessages();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-slate-900">{messages.dashboard.recentActivity}</h2>
        <div className="space-y-4">
          {data.stats.eventsCount === 0 && 
           data.stats.opportunitiesCount === 0 && 
           data.stats.postsCount === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-slate-600">{messages.dashboard.emptyContent}</p>
              <p className="mt-2 text-sm text-slate-500">
                {messages.dashboard.emptyContentHint}
              </p>
            </div>
          ) : (
            <>
              {data.stats.eventsCount > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="font-medium text-slate-900">📅 Événements créés</p>
                    <p className="text-sm text-slate-600">{data.stats.eventsCount} événement(s)</p>
                  </div>
                  <Link href="#events" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    {messages.dashboard.manage} →
                  </Link>
                </div>
              )}
              {data.stats.opportunitiesCount > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="font-medium text-slate-900">🎯 Annonces postées</p>
                    <p className="text-sm text-slate-600">{data.stats.opportunitiesCount} annonce(s)</p>
                  </div>
                  <Link href="#opportunities" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    {messages.dashboard.manage} →
                  </Link>
                </div>
              )}
              {data.stats.postsCount > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="font-medium text-slate-900">📝 Publications feed</p>
                    <p className="text-sm text-slate-600">{data.stats.postsCount} publication(s)</p>
                  </div>
                  <Link href="#posts" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    {messages.dashboard.manage} →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {data.association && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{messages.dashboard.association}</h3>
          <div className="space-y-2">
            <p><span className="font-medium">{messages.dashboard.association}:</span> {data.association.name}</p>
            <p><span className="font-medium">{messages.dashboard.associationStatus}:</span> {data.association.status}</p>
            <p><span className="font-medium">{messages.dashboard.members}:</span> {data.association.memberCount}</p>
          </div>
          <Link href="#association" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium">
            {messages.dashboard.manage} →
          </Link>
        </div>
      )}
    </div>
  );
}
