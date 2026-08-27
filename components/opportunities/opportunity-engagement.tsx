"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { applyToOpportunity, toggleSaveOpportunity } from "@/lib/actions/opportunities";
import type { Messages } from "@/lib/i18n";

export default function OpportunityEngagement({ opportunityId, initialSaved, labels }: { opportunityId: string; initialSaved: boolean; labels: Messages["opportunityEngagement"] }) {
  const [saved, setSaved] = useState(initialSaved);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    try { setSaved(await toggleSaveOpportunity(opportunityId)); } catch { setError(labels.error); } finally { setPending(false); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try { await applyToOpportunity(opportunityId, { coverLetter: String(data.get("coverLetter") ?? ""), cvUrl: String(data.get("cvUrl") ?? "") }); setOpen(false); } catch (submitError) { setError(submitError instanceof Error ? submitError.message : labels.error); } finally { setPending(false); }
  }

  return <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => void save()} disabled={pending} aria-pressed={saved} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{saved ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}{saved ? labels.saved : labels.save}</button><button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">{labels.apply}</button>{error && <p role="alert" className="basis-full text-sm text-red-700">{error}</p>}{open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"><section role="dialog" aria-modal="true" aria-labelledby="apply-title" className="w-full max-w-xl rounded-2xl bg-white p-6"><div className="flex items-start justify-between gap-4"><h2 id="apply-title" className="text-xl font-semibold text-slate-900">{labels.apply}</h2><button type="button" onClick={() => setOpen(false)} aria-label={labels.close} className="text-slate-500">×</button></div><form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-medium text-slate-700">{labels.coverLetter}<textarea name="coverLetter" rows={6} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal" /></label><label className="block text-sm font-medium text-slate-700">{labels.cvUrl}<input name="cvUrl" type="url" className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal" /></label><button type="submit" disabled={pending} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{labels.submit}</button></form></section></div>}</div>;
}
