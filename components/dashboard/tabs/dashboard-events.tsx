"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserDashboardData } from "@/lib/dashboard";
import { deleteUserEvent, cancelUserEvent } from "@/lib/dashboard-actions";
import { useMessages } from "@/components/i18n-provider";

interface DashboardEventsProps {
  events: UserDashboardData["events"];
}

export default function DashboardEvents({ events }: DashboardEventsProps) {
  const messages = useMessages();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (eventId: string) => {
    if (!confirm(messages.dashboard.deleteEvent + "?")) return;
    setDeleting(eventId);
    try {
      await deleteUserEvent(eventId);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete event:", error);
      setDeleting(null);
    }
  };

  const handleCancel = async (eventId: string) => {
    if (!confirm(messages.dashboard.cancelEvent + "?")) return;
    setDeleting(eventId);
    try {
      await cancelUserEvent(eventId);
      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel event:", error);
      setDeleting(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-slate-600">{messages.dashboard.noCreatedEvents}</p>
        <Link href="/events" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium">
          {messages.dashboard.exploreEvents} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">
              <Link href={`/events/${event.slug}`} className="hover:text-emerald-600">
                {event.title}
              </Link>
            </h3>
            <div className="mt-2 flex gap-4 text-sm text-slate-600">
              <span>📅 {new Date(event.startDate).toLocaleDateString("fr-FR")}</span>
              <span>👥 {event.participantCount} participant(s)</span>
              <span>{event.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/events/${event.slug}/edit`} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700">
              {messages.profile.edit}
            </Link>
            <button
              onClick={() => handleCancel(event.id)}
              disabled={deleting === event.id}
              className="px-3 py-1 text-sm rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
            >
              {messages.dashboard.cancelEvent}
            </button>
            <button
              onClick={() => handleDelete(event.id)}
              disabled={deleting === event.id}
              className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              {messages.dashboard.deleteEvent}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
