"use client";

import { useState } from "react";
import type { UserDashboardData } from "@/lib/dashboard";
import DashboardOverview from "./tabs/dashboard-overview";
import DashboardEvents from "./tabs/dashboard-events";
import DashboardOpportunities from "./tabs/dashboard-opportunities";
import DashboardAssociation from "./tabs/dashboard-association";
import DashboardPosts from "./tabs/dashboard-posts";

interface DashboardTabsProps {
  data: UserDashboardData;
}

type TabType = "overview" | "events" | "opportunities" | "association" | "posts";

export default function DashboardTabs({ data }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as const, label: "Aperçu", icon: "📊" },
    { id: "events" as const, label: "Mes Événements", icon: "📅", badge: data.stats.eventsCount },
    { id: "opportunities" as const, label: "Mes Annonces", icon: "🎯", badge: data.stats.opportunitiesCount },
    { id: "association" as const, label: "Mon Association", icon: "🏢", badge: data.stats.associationCount, disabled: !data.association },
    { id: "posts" as const, label: "Mes Publications", icon: "📝", badge: data.stats.postsCount },
  ];

  return (
    <div>
      <div className="mb-8 border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-600"
                  : tab.disabled
                    ? "border-transparent text-slate-400 cursor-not-allowed"
                    : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "overview" && <DashboardOverview data={data} />}
        {activeTab === "events" && <DashboardEvents events={data.events} />}
        {activeTab === "opportunities" && <DashboardOpportunities opportunities={data.opportunities} />}
        {activeTab === "association" && data.association && <DashboardAssociation association={data.association} />}
        {activeTab === "posts" && <DashboardPosts posts={data.posts} />}
      </div>
    </div>
  );
}
