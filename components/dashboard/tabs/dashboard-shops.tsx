"use client";

import Link from "next/link";
import { useState } from "react";
import { ShopStatus } from "@/app/generated/prisma";
import { useMessages } from "@/components/i18n-provider";
import { deleteUserShop, setUserShopStatus } from "@/lib/dashboard-actions";
import type { UserDashboardData } from "@/lib/dashboard";

export default function DashboardShops({ shops }: { shops: UserDashboardData["shops"] }) {
  const messages = useMessages();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function changeStatus(shopId: string, status: ShopStatus) {
    setPendingId(shopId);
    setFeedback(null);
    try {
      await setUserShopStatus(shopId, status);
      setFeedback(messages.status.success);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.status.error);
    } finally {
      setPendingId(null);
    }
  }

  async function remove(shopId: string) {
    if (!window.confirm(`${messages.dashboard.deleteShop}?`)) return;
    setPendingId(shopId);
    setFeedback(null);
    try {
      await deleteUserShop(shopId);
      setFeedback(messages.status.success);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.status.error);
    } finally {
      setPendingId(null);
    }
  }

  if (shops.length === 0) {
    return <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center"><p className="text-slate-600">{messages.dashboard.noShops}</p><Link href="/shops" className="mt-4 inline-block font-medium text-emerald-600">{messages.dashboard.exploreShops} →</Link></div>;
  }

  return <div className="space-y-4">{feedback && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</p>}{shops.map((shop) => { const pending = pendingId === shop.id; const nextStatus = shop.status === ShopStatus.PUBLISHED ? ShopStatus.DRAFT : ShopStatus.PUBLISHED; return <div key={shop.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-slate-900"><Link href={`/shops/${shop.slug}`} className="hover:text-emerald-600">{shop.name}</Link></h3><p className="mt-2 text-sm text-slate-600">{shop.status}</p></div><div className="flex flex-wrap gap-2"><Link href={`/shops/${shop.slug}/edit`} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700">{messages.profile.edit}</Link><button type="button" onClick={() => changeStatus(shop.id, nextStatus)} disabled={pending} className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 disabled:opacity-50">{nextStatus === ShopStatus.PUBLISHED ? messages.dashboard.publish : messages.dashboard.draft}</button><button type="button" onClick={() => remove(shop.id)} disabled={pending} className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-700 disabled:opacity-50">{messages.dashboard.deleteShop}</button></div></div>; })}</div>;
}
