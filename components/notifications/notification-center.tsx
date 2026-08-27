"use client";

import { useEffect, useState } from "react";
import { Bell, BookOpen, BriefcaseBusiness, CalendarDays, CheckCheck, GraduationCap, Info, MessageSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUnreadNotificationCount, getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions/notifications";
import type { Messages } from "@/lib/i18n";
import type { NotificationType } from "@/app/generated/prisma";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

type NotificationLabels = Messages["notifications"];

const icons = {
  NEWS: BookOpen,
  EVENT: CalendarDays,
  OPPORTUNITY: BriefcaseBusiness,
  CAMPUS: GraduationCap,
  SYSTEM: Info,
  MESSAGE: MessageSquare,
} satisfies Record<NotificationType, typeof Bell>;

function typeLabel(labels: NotificationLabels, type: NotificationType) {
  return labels[type.toLowerCase() as keyof NotificationLabels];
}

export default function NotificationCenter({ isAuthenticated, labels, locale }: { isAuthenticated: boolean; labels: NotificationLabels; locale: "fr" | "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function loadNotifications() {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [items, unreadCount] = await Promise.all([getUserNotifications({ limit: 10 }), getUnreadNotificationCount()]);
      setNotifications(items);
      setCount(unreadCount);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    Promise.all([getUserNotifications({ limit: 10 }), getUnreadNotificationCount()]).then(([items, unreadCount]) => {
      if (!active) return;
      setNotifications(items);
      setCount(unreadCount);
    }).catch(() => {
      if (active) setNotifications([]);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  async function openNotification(item: NotificationItem) {
    if (!item.isRead) {
      await markNotificationAsRead(item.id);
      setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, isRead: true } : notification));
      setCount((current) => Math.max(0, current - 1));
    }
    setIsOpen(false);
    if (item.link) router.push(item.link);
  }

  async function markAllRead() {
    await markAllNotificationsAsRead();
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setCount(0);
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button type="button" onClick={() => { setIsOpen((open) => !open); if (!isOpen) void loadNotifications(); }} aria-label={labels.open} aria-expanded={isOpen} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100">
        <Bell className="h-5 w-5" aria-hidden />
        {count > 0 && <span aria-label={`${count} ${labels.unread}`} className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-red-600 px-1 text-center text-[11px] font-bold leading-5 text-white">{count > 99 ? "99+" : count}</span>}
      </button>

      {isOpen && <>
        <button type="button" aria-label={labels.open} onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 cursor-default bg-transparent xl:hidden" />
        <section aria-label={labels.title} className="fixed inset-x-4 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:absolute sm:right-0 sm:top-12 sm:inset-x-auto sm:w-96">
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="font-semibold text-slate-900">{labels.title}</h2>
            <div className="flex items-center gap-1">
              {count > 0 && <button type="button" onClick={() => void markAllRead()} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"><CheckCheck className="h-4 w-4" aria-hidden />{labels.markAllRead}</button>}
              <button type="button" onClick={() => setIsOpen(false)} aria-label={labels.open} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" aria-hidden /></button>
            </div>
          </header>
          {isLoading ? <div className="space-y-3 py-4" aria-busy="true">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}</div> : notifications.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">{labels.empty}</p> : <ul className="divide-y divide-slate-100">{notifications.map((item) => { const Icon = icons[item.type]; return <li key={item.id}><button type="button" onClick={() => void openNotification(item)} className={`flex w-full gap-3 px-2 py-4 text-left hover:bg-slate-50 ${item.isRead ? "" : "bg-emerald-50/50"}`}><span className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-700"><Icon className="h-4 w-4" aria-hidden /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-slate-900">{item.title}</strong>{!item.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-label={labels.unread} />}</span><span className="mt-1 block text-xs font-medium text-emerald-700">{typeLabel(labels, item.type)} · {new Date(item.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{item.message}</span></span></button></li>; })}</ul>}
        </section>
      </>}
    </div>
  );
}
