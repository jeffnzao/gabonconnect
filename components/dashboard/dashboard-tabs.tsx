"use client";

import { useState } from "react";
import type { UserDashboardData } from "@/lib/dashboard";
import DashboardOverview from "./tabs/dashboard-overview";
import DashboardEvents from "./tabs/dashboard-events";
import DashboardOpportunities from "./tabs/dashboard-opportunities";
import DashboardAssociation from "./tabs/dashboard-association";
import DashboardPosts from "./tabs/dashboard-posts";
import DashboardArticles from "./tabs/dashboard-articles";
import DashboardShops from "./tabs/dashboard-shops";
import { useMessages } from "@/components/i18n-provider";

interface DashboardTabsProps {
  data: UserDashboardData;
}

type TabType = "overview" | "articles" | "shops" | "events" | "opportunities" | "association" | "posts";

export default function DashboardTabs({ data }: DashboardTabsProps) {
  const messages = useMessages();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as const, label: messages.dashboard.overview, icon: "📊" },
    { id: "articles" as const, label: messages.dashboard.articles, icon: "📰", badge: data.stats.articlesCount },
    { id: "shops" as const, label: messages.dashboard.shops, icon: "🏪", badge: data.stats.shopsCount },
    { id: "events" as const, label: messages.dashboard.events, icon: "📅", badge: data.stats.eventsCount },
    { id: "opportunities" as const, label: messages.dashboard.opportunities, icon: "🎯", badge: data.stats.opportunitiesCount },
    { id: "association" as const, label: messages.dashboard.association, icon: "🏢", badge: data.stats.associationCount, disabled: !data.association },
    { id: "posts" as const, label: messages.dashboard.posts, icon: "📝", badge: data.stats.postsCount },
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
        {activeTab === "articles" && <DashboardArticles articles={data.articles} />}
        {activeTab === "shops" && <DashboardShops shops={data.shops} />}
        {activeTab === "events" && <DashboardEvents events={data.events} />}
        {activeTab === "opportunities" && <DashboardOpportunities opportunities={data.opportunities} />}
        {activeTab === "association" && data.association && <DashboardAssociation association={data.association} />}
        {activeTab === "posts" && <DashboardPosts posts={data.posts} />}
      </div>
    </div>
  );
}
