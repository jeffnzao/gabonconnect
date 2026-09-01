import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { getProcedureBySlug } from "@/lib/procedures";
import ProcedureChecklist from "@/components/procedures/procedure-checklist";
import { getProcedureDescription, getProcedureTitle, getStepDescription, getStepTitle } from "@/components/procedures/procedure-copy";

type ProcedurePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProcedurePageProps): Promise<Metadata> {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const procedure = await getProcedureBySlug((await params).slug);
  return { title: procedure ? getProcedureTitle(messages, procedure.slug, procedure.title) : messages.procedures.title };
}

export default async function ProcedureDetailPage({ params }: ProcedurePageProps) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const user = await getCurrentUser();
  const procedure = await getProcedureBySlug((await params).slug, user?.id);
  if (!procedure) notFound();

  const completedStepIds = procedure.progress?.completedStepIds ?? [];
  const status = procedure.progress?.status ?? "NOT_STARTED";
  const statusLabel = messages.procedures[status === "IN_PROGRESS" ? "inProgress" : status === "COMPLETED" ? "completed" : "notStarted"];
  const steps = procedure.steps.map((step) => ({ ...step, title: getStepTitle(messages, procedure.slug, step.order, step.title), description: getStepDescription(messages, procedure.slug, step.order, step.description) }));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/dashboard/procedures" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">{messages.procedures.title}</Link>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{messages.procedures[procedure.category.toLowerCase() as keyof typeof messages.procedures]}</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{getProcedureTitle(messages, procedure.slug, procedure.title)}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{getProcedureDescription(messages, procedure.slug, procedure.description)}</p>
        {procedure.sourceName && <p className="mt-3 text-sm font-semibold text-sky-700">Source : {procedure.sourceName}</p>}
        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3"><div><p className="text-xs font-semibold uppercase text-slate-500">{messages.procedures.estimatedDays}</p><p className="mt-1 font-semibold text-slate-900">{procedure.estimatedDays} {messages.procedures.days}</p></div><div><p className="text-xs font-semibold uppercase text-slate-500">{messages.procedures.cost}</p><p className="mt-1 font-semibold text-slate-900">{procedure.cost}</p></div><div><p className="text-xs font-semibold uppercase text-slate-500">{messages.procedures.progress}</p><p className="mt-1 font-semibold text-emerald-700">{statusLabel}</p></div></div>
        <a href={procedure.officialUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{messages.procedures.officialLink}</a>
      </div>
      <ProcedureChecklist procedureId={procedure.id} steps={steps} completedStepIds={completedStepIds} isAuthenticated={Boolean(user)} labels={messages.procedures} />
    </main>
  );
}
