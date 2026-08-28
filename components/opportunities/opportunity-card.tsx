import Link from "next/link";
import { MapPin, Wifi } from "lucide-react";
import { getLocale, getMessages } from "@/lib/i18n";

interface OpportunityCardProps {
  opportunity: {
    slug: string;
    title: string;
    type: string;
    location: string;
    isRemote: boolean;
    companyName: string | null;
    association: { name: string } | null;
    createdAt: Date;
    canonicalUrl: string | null;
    sourceName: string | null;
  };
}

export default async function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const messages = getMessages(await getLocale());
  const issuer = opportunity.association?.name ?? opportunity.companyName ?? "GabonConnect";
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">{opportunity.type.replace("_", " ")}</span>
      {opportunity.sourceName && <span className="mt-2 w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{messages.opportunities.externalSource}: {opportunity.sourceName}</span>}
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{opportunity.title}</h2>
      <p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4 text-emerald-600" aria-hidden />{opportunity.location}</p>
      {opportunity.isRemote && <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Wifi className="h-4 w-4 text-emerald-600" aria-hidden />{messages.directories.remoteAvailable}</p>}
      <p className="mt-4 text-sm text-slate-500">{messages.directories.postedBy} {issuer}</p>
      <p className="mt-2 text-xs text-slate-400">{opportunity.createdAt.toLocaleDateString("en-US")}</p>
      <Link href={`/opportunities/${opportunity.slug}`} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">{messages.directories.viewOpportunity} <span className="ml-1" aria-hidden>→</span></Link>
      {opportunity.canonicalUrl && <a href={opportunity.canonicalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-emerald-700">{messages.opportunities.officialApply}</a>}
    </article>
  );
}