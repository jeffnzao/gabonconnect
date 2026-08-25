"use client";

import Image from "next/image";
import { useState } from "react";
import { UserStatus } from "@/app/generated/prisma";
import { updateUserPresenceStatus, hideUserPresence, showUserPresence } from "@/lib/dashboard-actions";

interface DashboardHeaderProps {
  data: {
    profile: {
      firstName: string;
      lastName: string;
      photo: string | null;
      status: string;
      showStatus: boolean;
    };
    stats: {
      eventsCount: number;
      opportunitiesCount: number;
      postsCount: number;
      associationCount: number;
    };
  };
}

interface DashboardHeaderProps {
  data: {
    profile: {
      firstName: string;
      lastName: string;
      photo: string | null;
      status: string;
      showStatus: boolean;
    };
    stats: {
      eventsCount: number;
      opportunitiesCount: number;
      postsCount: number;
      associationCount: number;
    };
  };
}

export default function DashboardHeader({ data }: DashboardHeaderProps) {
  const [status, setStatus] = useState<UserStatus>(data.profile.status as UserStatus);
  const [showStatus, setShowStatus] = useState(data.profile.showStatus);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: UserStatus) => {
    setUpdating(true);
    try {
      setStatus(newStatus);
      await updateUserPresenceStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      setStatus(data.profile.status as UserStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleVisibilityToggle = async () => {
    setUpdating(true);
    try {
      if (showStatus) {
        await hideUserPresence();
        setShowStatus(false);
      } else {
        await showUserPresence();
        setShowStatus(true);
      }
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = {
    ONLINE: "bg-emerald-500",
    AWAY: "bg-yellow-500",
    BUSY: "bg-red-500",
    OFFLINE: "bg-slate-400",
    INCOGNITO: "bg-purple-500",
  };

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {data.profile.photo && (
              <Image
                src={data.profile.photo}
                alt={`${data.profile.firstName} ${data.profile.lastName}`}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {data.profile.firstName} {data.profile.lastName}
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${statusColor[status as keyof typeof statusColor] || "bg-slate-400"}`} />
                  <span className="text-sm text-slate-600">{status}</span>
                </div>
                <button
                  onClick={handleVisibilityToggle}
                  disabled={updating}
                  className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
                >
                  {showStatus ? "Masquer mon statut" : "Afficher mon statut"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {Object.entries(statusColor).map(([statusKey]) => (
              <button
                key={statusKey}
                onClick={() => handleStatusChange(statusKey as UserStatus)}
                disabled={updating || status === statusKey}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  status === statusKey
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } disabled:opacity-50`}
              >
                {statusKey}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{data.stats.eventsCount}</div>
            <div className="text-sm text-slate-600">Événements</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{data.stats.opportunitiesCount}</div>
            <div className="text-sm text-slate-600">Annonces</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{data.stats.postsCount}</div>
            <div className="text-sm text-slate-600">Publications</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{data.stats.associationCount}</div>
            <div className="text-sm text-slate-600">Associations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
