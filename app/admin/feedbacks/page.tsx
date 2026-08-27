import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Lightbulb, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import FeedbackModerationActions from "@/components/admin/feedback-moderation-actions";
import {
  listFeedbacksForAdmin,
  type AdminFeedback,
} from "@/lib/feedback-admin-actions";

export const dynamic = "force-dynamic";

const statusKeys = ["pending", "published", "hidden", "processed", "archived"] as const;

type PageProps = {
  searchParams: Promise<{ status?: string; page?: string; message?: string }>;
};

function statusLabel(messages: ReturnType<typeof getMessages>, status: AdminFeedback["status"]) {
  return messages.adminFeedback[status];
}

export default async function FeedbackAdminPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const status = statusKeys.includes(params.status as (typeof statusKeys)[number]) ? params.status : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  let result;
  try {
    result = await listFeedbacksForAdmin({ status, page });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required.") redirect("/");
    throw error;
  }

  const locale = await getLocale();
  const messages = getMessages(locale);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const message = params.message === "updated" ? messages.adminFeedback.updated : params.message === "deleted" ? messages.adminFeedback.deleted : params.message === "error" ? messages.adminFeedback.error : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">{messages.adminFeedback.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{messages.adminFeedback.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{messages.adminFeedback.intro}</p>
      </header>

      {message && <p role={params.message === "error" ? "alert" : "status"} className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4" method="get">
        <label className="flex min-w-48 flex-1 flex-col gap-2 text-sm font-semibold text-slate-700">
          {messages.adminFeedback.status}
          <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-500">
            <option value="">{messages.adminFeedback.allStatuses}</option>
            {statusKeys.map((key) => <option key={key} value={key}>{messages.adminFeedback[key]}</option>)}
          </select>
        </label>
        <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">{messages.adminFeedback.filter}</button>
      </form>

      {result.feedbacks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.adminFeedback.noFeedback}</p>
      ) : (
        <div className="space-y-4">
          {result.feedbacks.map((feedback) => (
            <FeedbackRow key={feedback.id} feedback={feedback} messages={messages} />
          ))}
        </div>
      )}

      <nav aria-label={`${messages.adminFeedback.title} pagination`} className="mt-8 flex items-center justify-between gap-4 text-sm">
        <a aria-disabled={page <= 1} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-semibold ${page <= 1 ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`} href={`?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page - 1) })}`}><ChevronLeft className="h-4 w-4" aria-hidden />{messages.adminFeedback.previous}</a>
        <span className="text-slate-500">{page} / {totalPages}</span>
        <a aria-disabled={page >= totalPages} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-semibold ${page >= totalPages ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`} href={`?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page + 1) })}`}>{messages.adminFeedback.next}<ChevronRight className="h-4 w-4" aria-hidden /></a>
      </nav>
    </main>
  );
}

function FeedbackRow({ feedback, messages }: { feedback: AdminFeedback; messages: ReturnType<typeof getMessages> }) {
  const date = new Date(feedback.created_at).toLocaleDateString(feedback.locale === "fr" ? "fr-FR" : "en-US");
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <time dateTime={feedback.created_at}>{date}</time>
          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold uppercase text-slate-700">{feedback.locale}</span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{statusLabel(messages, feedback.status)}</span>
          {feedback.ideas && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700"><Lightbulb className="h-3 w-3" aria-hidden />{messages.adminFeedback.hasIdea}</span>}
          {feedback.bugs && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 font-semibold text-red-700"><ShieldAlert className="h-3 w-3" aria-hidden />{messages.adminFeedback.hasBug}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <FeedbackModerationActions id={feedback.id} published={feedback.status === "published"} processed={feedback.status === "processed"} labels={messages.adminFeedback} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        {feedback.likes && <p><strong>{messages.feedback.likesLabel}:</strong> {feedback.likes}</p>}
        {feedback.ideas && <p><strong>{messages.feedback.ideasLabel}:</strong> {feedback.ideas}</p>}
        {feedback.dislikes && <p><strong>{messages.feedback.dislikesLabel}:</strong> {feedback.dislikes}</p>}
        {feedback.bugs && <p><strong>{messages.feedback.bugsLabel}:</strong> {feedback.bugs}</p>}
      </div>
    </article>
  );
}
