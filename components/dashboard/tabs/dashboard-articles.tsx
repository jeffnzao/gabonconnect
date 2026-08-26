"use client";

import Link from "next/link";
import { useState } from "react";
import { ArticleStatus } from "@/app/generated/prisma";
import { useMessages } from "@/components/i18n-provider";
import { deleteUserArticle, setUserArticleStatus } from "@/lib/dashboard-actions";
import type { UserDashboardData } from "@/lib/dashboard";

export default function DashboardArticles({ articles }: { articles: UserDashboardData["articles"] }) {
  const messages = useMessages();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function changeStatus(articleId: string, status: ArticleStatus) {
    setPendingId(articleId);
    setFeedback(null);
    try {
      await setUserArticleStatus(articleId, status);
      setFeedback(messages.status.success);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.status.error);
    } finally {
      setPendingId(null);
    }
  }

  async function remove(articleId: string) {
    if (!window.confirm(`${messages.dashboard.deleteArticle}?`)) return;
    setPendingId(articleId);
    setFeedback(null);
    try {
      await deleteUserArticle(articleId);
      setFeedback(messages.status.success);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : messages.status.error);
    } finally {
      setPendingId(null);
    }
  }

  if (articles.length === 0) {
    return <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center"><p className="text-slate-600">{messages.dashboard.noArticles}</p><Link href="/news" className="mt-4 inline-block font-medium text-emerald-600">{messages.dashboard.exploreNews} →</Link></div>;
  }

  return <div className="space-y-4">{feedback && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</p>}{articles.map((article) => { const pending = pendingId === article.id; const nextStatus = article.status === ArticleStatus.PUBLISHED ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED; return <div key={article.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-slate-900"><Link href={`/news/${article.slug}`} className="hover:text-emerald-600">{article.title}</Link></h3><p className="mt-2 text-sm text-slate-600">{article.status}</p></div><div className="flex flex-wrap gap-2"><Link href={`/news/${article.slug}/edit`} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700">{messages.profile.edit}</Link><button type="button" onClick={() => changeStatus(article.id, nextStatus)} disabled={pending} className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 disabled:opacity-50">{nextStatus === ArticleStatus.PUBLISHED ? messages.dashboard.publish : messages.dashboard.draft}</button><button type="button" onClick={() => remove(article.id)} disabled={pending} className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-700 disabled:opacity-50">{messages.dashboard.deleteArticle}</button></div></div>; })}</div>;
}
