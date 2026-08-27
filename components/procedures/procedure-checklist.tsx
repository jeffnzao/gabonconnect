"use client";

import { useState } from "react";
import { toggleProcedureStep } from "@/lib/actions/procedures";
import type { Messages } from "@/lib/i18n";

export default function ProcedureChecklist({ procedureId, steps, completedStepIds, isAuthenticated, labels }: { procedureId: string; steps: { id: string; title: string; description: string; order: number; isRequired: boolean }[]; completedStepIds: string[]; isAuthenticated: boolean; labels: Messages["procedures"] }) {
  const [completed, setCompleted] = useState(() => new Set(completedStepIds));
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function updateStep(stepId: string, checked: boolean) {
    if (!isAuthenticated) return;
    const previous = new Set(completed);
    setCompleted((current) => { const next = new Set(current); if (checked) next.add(stepId); else next.delete(stepId); return next; });
    setPendingId(stepId);
    try {
      await toggleProcedureStep(procedureId, stepId, checked);
    } catch {
      setCompleted(previous);
    } finally {
      setPendingId(null);
    }
  }

  const percent = steps.length === 0 ? 0 : Math.round((completed.size / steps.length) * 100);

  return (
    <section aria-labelledby="procedure-checklist" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 id="procedure-checklist" className="text-xl font-semibold text-slate-900">{labels.checklist}</h2>
        <span className="text-sm font-semibold text-emerald-700">{percent}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} /></div>
      {!isAuthenticated && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{labels.loginToTrack}</p>}
      <ol className="mt-6 space-y-4">
        {steps.map((step) => <li key={step.id} className="flex gap-3 rounded-xl border border-slate-100 p-4"><input id={`step-${step.id}`} type="checkbox" checked={completed.has(step.id)} disabled={!isAuthenticated || pendingId === step.id} onChange={(event) => void updateStep(step.id, event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-emerald-600" /><label htmlFor={`step-${step.id}`} className="min-w-0"><span className="block font-semibold text-slate-900">{step.order}. {step.title}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{step.description}</span></label></li>)}
      </ol>
    </section>
  );
}
