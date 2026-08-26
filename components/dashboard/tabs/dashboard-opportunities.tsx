"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserDashboardData } from "@/lib/dashboard";
import { deleteUserOpportunity, closeUserOpportunity } from "@/lib/dashboard-actions";
import { useMessages } from "@/components/i18n-provider";

interface DashboardOpportunitiesProps {
  opportunities: UserDashboardData["opportunities"];
}

export default function DashboardOpportunities({ opportunities }: DashboardOpportunitiesProps) {
  const messages = useMessages();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (opportunityId: string) => {
    if (!confirm(messages.dashboard.deleteOpportunity + "?")) return;
    setDeleting(opportunityId);
    try {
      await deleteUserOpportunity(opportunityId);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete opportunity:", error);
      setDeleting(null);
    }
  };

  const handleClose = async (opportunityId: string) => {
    if (!confirm(messages.dashboard.closeOpportunity + "?")) return;
    setDeleting(opportunityId);
    try {
      await closeUserOpportunity(opportunityId);
      window.location.reload();
    } catch (error) {
      console.error("Failed to close opportunity:", error);
      setDeleting(null);
    }
  };

  if (opportunities.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-slate-600">{messages.dashboard.noPostedOpportunities}</p>
        <Link href="/opportunities" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium">
          {messages.dashboard.exploreOpportunities} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opp) => (
        <div key={opp.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">
              <Link href={`/opportunities/${opp.slug}`} className="hover:text-emerald-600">
                {opp.title}
              </Link>
            </h3>
            <div className="mt-2 flex gap-4 text-sm text-slate-600">
              <span>🏷️ {opp.type}</span>
              <span>📝 {opp.applicationCount} candidature(s)</span>
              <span>Statut: {opp.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/opportunities/${opp.slug}/edit`} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700">
              {messages.profile.edit}
            </Link>
            <button
              onClick={() => handleClose(opp.id)}
              disabled={deleting === opp.id}
              className="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              {messages.dashboard.closeOpportunity}
            </button>
            <button
              onClick={() => handleDelete(opp.id)}
              disabled={deleting === opp.id}
              className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              {messages.dashboard.deleteOpportunity}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
