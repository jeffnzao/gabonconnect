import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getCurrentUser } from "@/lib/auth";
import { getOpportunityBySlug } from "@/lib/opportunities";
import { applyToOpportunityFromForm, hasAppliedToOpportunity } from "@/lib/opportunity-actions";

interface OpportunityDetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: OpportunityDetailProps): Promise<Metadata> {
  const opportunity = await getOpportunityBySlug((await params).slug);
  return { title: opportunity ? `${opportunity.title} | GabonConnect` : "Opportunity | GabonConnect" };
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailProps) {
  const opportunity = await getOpportunityBySlug((await params).slug);
  if (!opportunity) notFound();
  const user = await getCurrentUser();
  const hasApplied = user ? await hasAppliedToOpportunity(opportunity.id) : false;
  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-10"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Opportunities", href: "/opportunities" }, { label: opportunity.title }]} /><span className="mt-10 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">{opportunity.type.replace("_", " ")}</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{opportunity.title}</h1><p className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">{opportunity.description}</p><dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt><dd className="mt-1 text-sm text-slate-900">{opportunity.location}{opportunity.isRemote ? " (remote available)" : ""}</dd></div><div><dt className="text-xs uppercase tracking-wide text-slate-500">Applications</dt><dd className="mt-1 text-sm text-slate-900">{opportunity._count.applications}</dd></div></dl>{opportunity.association && <p className="mt-5 text-sm text-slate-500">Posted by {opportunity.association.name}</p>}{opportunity.applicationUrl && <a href={opportunity.applicationUrl} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">Apply externally</a>}{opportunity.contactEmail && <p className="mt-3 text-sm text-slate-600">Contact: {opportunity.contactEmail}</p>}{user ? hasApplied ? <p className="mt-8 text-sm font-semibold text-emerald-700">You have already applied.</p> : <form action={applyToOpportunityFromForm.bind(null, opportunity.id)} className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6"><label htmlFor="message" className="text-sm font-medium text-slate-700">Message (optional)</label><textarea id="message" name="message" rows={5} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button type="submit" className="w-fit rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950">Apply</button></form> : <p className="mt-8 text-sm text-slate-500">Log in to apply.</p>}</article>
  );
}