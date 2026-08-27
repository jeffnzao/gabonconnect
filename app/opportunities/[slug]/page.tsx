import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import OpportunityEngagement from "@/components/opportunities/opportunity-engagement";
import { getCurrentUser } from "@/lib/auth";
import { getOpportunityBySlug } from "@/lib/opportunities";
import { hasAppliedToOpportunity } from "@/lib/opportunity-actions";
import { hasSavedOpportunity } from "@/lib/actions/opportunities";
import { getLocale, getMessages } from "@/lib/i18n";

interface OpportunityDetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: OpportunityDetailProps): Promise<Metadata> {
  const opportunity = await getOpportunityBySlug((await params).slug);
  return { title: opportunity ? `${opportunity.title} | GabonConnect` : "Opportunity | GabonConnect" };
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailProps) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const opportunity = await getOpportunityBySlug((await params).slug);
  if (!opportunity) notFound();

  const user = await getCurrentUser();
  const [hasApplied, hasSaved] = user ? await Promise.all([hasAppliedToOpportunity(opportunity.id), hasSavedOpportunity(opportunity.id)]) : [false, false];

  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.opportunities, href: "/opportunities" }, { label: opportunity.title }]} />
      <span className="mt-10 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">{opportunity.type.replace("_", " ")}</span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{opportunity.title}</h1>
      <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">{opportunity.description}</p>
      <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div><dt className="text-xs uppercase tracking-wide text-slate-500">{messages.directories.location}</dt><dd className="mt-1 text-sm text-slate-900">{opportunity.location}{opportunity.isRemote ? ` (${messages.directories.remoteAvailable})` : ""}</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-slate-500">{messages.directories.applications}</dt><dd className="mt-1 text-sm text-slate-900">{opportunity._count.applications}</dd></div>
      </dl>
      {opportunity.association && <p className="mt-5 text-sm text-slate-500">{messages.directories.postedBy} {opportunity.association.name}</p>}
      {opportunity.applicationUrl && <a href={opportunity.applicationUrl} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">{messages.directories.applyExternally}</a>}
      {opportunity.contactEmail && <p className="mt-3 text-sm text-slate-600">{messages.directories.contact}: {opportunity.contactEmail}</p>}
      {user ? <><OpportunityEngagement opportunityId={opportunity.id} initialSaved={hasSaved} labels={messages.opportunityEngagement} />{hasApplied && <p className="mt-3 text-sm font-semibold text-emerald-700">{messages.opportunityEngagement.alreadyApplied}</p>}</> : <p className="mt-8 text-sm text-slate-500">{messages.events.loginToJoin}</p>}
    </article>
  );
}
