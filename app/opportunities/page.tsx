import type { Metadata } from "next";
import Breadcrumb from "@/components/explore/breadcrumb";
import OpportunityCard from "@/components/opportunities/opportunity-card";
import { getOpportunities, type OpportunityFilters } from "@/lib/opportunities";

export const metadata: Metadata = { title: "Opportunities | GabonConnect" };

interface OpportunitiesPageProps { searchParams: Promise<Record<string, string | string[] | undefined>> }
function first(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const params = await searchParams;
  const type = first(params.type);
  const filters: OpportunityFilters = {
    type: ["JOB", "INTERNSHIP", "VOLUNTEERING", "PROJECT_CALL", "MUTUAL_AID"].includes(type ?? "") ? type as OpportunityFilters["type"] : undefined,
    location: first(params.location),
    associationId: first(params.associationId),
  };
  const opportunities = await getOpportunities(filters);
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white"><div className="mx-auto w-full max-w-6xl px-6 py-10"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Opportunities" }]} /><h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Opportunities</h1><p className="mt-2 text-sm text-slate-500">Jobs, internships, volunteering, and community calls.</p></div></section>
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10"><form className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row"><select name="type" defaultValue={type ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">All types</option>{["JOB", "INTERNSHIP", "VOLUNTEERING", "PROJECT_CALL", "MUTUAL_AID"].map((value) => <option key={value} value={value}>{value.replace("_", " ")}</option>)}</select><input name="location" defaultValue={first(params.location) ?? ""} placeholder="Location" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button type="submit" className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950">Filter</button></form>{opportunities.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No published opportunities yet.</p> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}</div>}</section>
    </div>
  );
}