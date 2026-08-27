import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSavedOpportunities, getUserOpportunityApplications, getReceivedOpportunityApplications } from "@/lib/actions/opportunities";
import ApplicationStatusForm from "@/components/opportunities/application-status-form";
import type { OpportunityApplicationStatus } from "@/app/generated/prisma";

export const dynamic = "force-dynamic";

export default async function OpportunityDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/opportunities");
  const locale = await getLocale();
  const messages = getMessages(locale);
  const [saved, applications, received] = await Promise.all([getSavedOpportunities(), getUserOpportunityApplications(), getReceivedOpportunityApplications()]);
  const labels = messages.opportunityEngagement;

  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12"><h1 className="text-3xl font-semibold tracking-tight text-slate-900">{messages.dashboard.opportunities}</h1><section className="mt-8"><h2 className="text-xl font-semibold text-slate-900">{messages.opportunityEngagement.savedTitle}</h2>{saved.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{messages.opportunityEngagement.noSaved}</p> : <div className="mt-4 grid gap-4 md:grid-cols-3">{saved.map((item) => <Link key={item.opportunity.id} href={`/opportunities/${item.opportunity.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300"><h3 className="font-semibold text-slate-900">{item.opportunity.title}</h3><p className="mt-2 text-sm text-slate-500">{item.opportunity.location}</p></Link>)}</div>}</section><section className="mt-10"><h2 className="text-xl font-semibold text-slate-900">{messages.opportunityEngagement.myApplications}</h2>{applications.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{messages.opportunityEngagement.noApplications}</p> : <div className="mt-4 space-y-3">{applications.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><Link href={`/opportunities/${item.opportunity.slug}`} className="font-semibold text-slate-900 hover:text-emerald-700">{item.opportunity.title}</Link><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{labels[item.status.toLowerCase() as keyof typeof labels]}</span></div>)}</div>}</section>{received.length > 0 && <section className="mt-10"><h2 className="text-xl font-semibold text-slate-900">{labels.received}</h2><div className="mt-4 space-y-3">{received.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.applicant.profile ? `${item.applicant.profile.firstName} ${item.applicant.profile.lastName}` : item.applicant.email}</p><p className="text-sm text-slate-500">{item.opportunity.title}</p></div><ApplicationStatusForm applicationId={item.id} currentStatus={item.status as OpportunityApplicationStatus} labels={labels} /></div>{item.coverLetter && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.coverLetter}</p>}{item.cvUrl && <a href={item.cvUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-emerald-700">{labels.cvUrl}</a>}</div>)}</div></section>}</main>;
}
