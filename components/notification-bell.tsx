"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { markAsReadAction } from "@/app/actions/notifications";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: Boolean;
  createdAt: Date;
}

export default function NotificationBell({
  unreadCount,
  notifications,
}: {
  unreadCount: number;
  notifications: NotificationItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRead = async (id: string, link: string | null) => {
    await markAsReadAction(id);
    if (link) window.location.href = link;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-slate-100 font-semibold text-sm">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-xs text-slate-500 text-center">Aucune notification</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id, n.link)}
                className={`p-3 border-b border-slate-50 text-xs cursor-pointer hover:bg-slate-50 ${
                  !n.isRead ? "bg-blue-50/50 font-medium" : "text-slate-600"
                }`}
              >
                <div className="font-semibold text-slate-800">{n.title}</div>
                <div>{n.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}