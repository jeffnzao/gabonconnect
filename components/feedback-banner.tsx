"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useMessages } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n-config";

export default function FeedbackBanner({ locale }: { locale: Locale }) {
  const messages = useMessages();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          likes: formData.get("likes"),
          ideas: formData.get("ideas"),
          dislikes: formData.get("dislikes"),
          bugs: formData.get("bugs"),
          website: formData.get("website"),
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error(messages.feedback.error);
      }

      setIsSubmitted(true);
    } catch {
      setError(messages.feedback.error);
    }
    setIsSubmitting(false);
  }

  function close() {
    setIsOpen(false);
    setIsSubmitted(false);
    setError(null);
  }

  return (
    <>
      <aside className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-lg shadow-slate-900/10">
        <div className="flex items-center gap-3">
          <MessageSquare className="hidden h-5 w-5 shrink-0 text-emerald-600 sm:block" aria-hidden />
          <p className="text-sm font-medium text-slate-700">{messages.feedback.banner}</p>
        </div>
        <button type="button" onClick={() => setIsOpen(true)} className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
          {messages.feedback.open}
        </button>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="feedback-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{messages.feedback.eyebrow}</p>
                <h2 id="feedback-title" className="mt-2 text-2xl font-semibold text-slate-900">{messages.feedback.title}</h2>
              </div>
              <button type="button" onClick={close} aria-label={messages.actions.close} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" aria-hidden /></button>
            </div>

            {isSubmitted ? (
              <div className="py-10 text-center"><p className="text-lg font-semibold text-emerald-700">{messages.feedback.thanks}</p><button type="button" onClick={close} className="mt-6 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950">{messages.actions.close}</button></div>
            ) : (
              <form onSubmit={submitFeedback} className="mt-6 space-y-5">
                <label className="block text-sm font-medium text-slate-700">{messages.feedback.likes}<textarea name="likes" rows={3} maxLength={2000} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-400" /></label>
                <label className="block text-sm font-medium text-slate-700">{messages.feedback.ideas}<textarea name="ideas" rows={3} maxLength={2000} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-400" /></label>
                <label className="block text-sm font-medium text-slate-700">{messages.feedback.dislikes}<textarea name="dislikes" rows={3} maxLength={2000} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-400" /></label>
                <label className="block text-sm font-medium text-slate-700">{messages.feedback.bugs}<textarea name="bugs" rows={3} maxLength={2000} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-400" /></label>
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                <div className="flex justify-end gap-3"><button type="button" onClick={close} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">{messages.actions.cancel}</button><button type="submit" disabled={isSubmitting} className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">{isSubmitting ? messages.feedback.sending : messages.feedback.submit}</button></div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
