import type { Metadata } from "next";
import Link from "next/link";
import { Archive, BadgeCheck, BookOpen, CalendarDays, Landmark, UsersRound } from "lucide-react";
import { HistoricalScope, HistoricalStatus, SourceLevel, type DiasporaImpact, type HistoricalArchive, type HistoricalEvent, type HistoricalFigure } from "@/app/generated/prisma";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getLocale, getMessages } from "@/lib/i18n";
import { getMemoryContent, historicalScopes, historicalStatuses, isMemoryTab, memoryTabs, sourceLevels, type MemoryFilters, type MemoryTab } from "@/lib/memoire";

export const dynamic = "force-dynamic";

type MemoryPageProps = { searchParams: Promise<{ tab?: string; q?: string; status?: string; scope?: string; source?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale());
  return { title: messages.memoire.title, description: messages.memoire.intro };
}

function isEnumValue<T extends string>(values: readonly T[], value: string | undefined): value is T {
  return Boolean(value && values.includes(value as T));
}

function tabHref(tab: MemoryTab, filters: Omit<MemoryFilters, "tab">): string {
  const params = new URLSearchParams({ tab });
  if (filters.period) params.set("q", filters.period);
  if (filters.status) params.set("status", filters.status);
  if (filters.scope) params.set("scope", filters.scope);
  if (filters.sourceLevel) params.set("source", filters.sourceLevel);
  return `/memoire?${params.toString()}`;
}

const tabIcons = { events: Landmark, figures: UsersRound, archives: Archive, diaspora: BookOpen };

function Traceability({ level, scope, decision }: { level: SourceLevel; scope?: HistoricalScope; decision: unknown }) {
  const score = typeof decision === "object" && decision !== null && "score" in decision ? String(decision.score) : null;
  return <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">{level}</span>{scope && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{scope}</span>}{score && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" aria-hidden />GRE {score}</span>}</div>;
}

export default async function MemoirePage({ searchParams }: MemoryPageProps) {
  const messages = getMessages(await getLocale());
  const params = await searchParams;
  const tab = isMemoryTab(params.tab) ? params.tab : "events";
  const filters: MemoryFilters = {
    tab,
    period: params.q?.trim() || undefined,
    status: isEnumValue(historicalStatuses, params.status) ? params.status : undefined,
    scope: isEnumValue(historicalScopes, params.scope) ? params.scope : undefined,
    sourceLevel: isEnumValue(sourceLevels, params.source) ? params.source : undefined,
  };
  const items = await getMemoryContent(filters);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.memory }]} />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">{messages.memoire.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{messages.memoire.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{messages.memoire.intro}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <nav aria-label={messages.memoire.title} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {memoryTabs.map((item) => {
            const Icon = tabIcons[item];
            return <Link key={item} href={tabHref(item, filters)} aria-current={tab === item ? "page" : undefined} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${tab === item ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"}`}><Icon className="h-4 w-4" aria-hidden />{messages.memoire[item]}</Link>;
          })}
        </nav>

        <form method="get" className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input type="hidden" name="tab" value={tab} />
          <input name="q" defaultValue={filters.period} placeholder={messages.memoire.period} className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          {tab !== "archives" && <select name="status" defaultValue={filters.status ?? ""} aria-label={messages.memoire.status} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">{messages.memoire.allStatuses}</option>{historicalStatuses.map((value) => <option key={value} value={value}>{value}</option>)}</select>}
          {tab !== "archives" && <select name="scope" defaultValue={filters.scope ?? ""} aria-label={messages.memoire.scope} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">{messages.memoire.allScopes}</option>{historicalScopes.map((value) => <option key={value} value={value}>{value}</option>)}</select>}
          <select name="source" defaultValue={filters.sourceLevel ?? ""} aria-label={messages.memoire.sourceLevel} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">{messages.memoire.allSources}</option>{sourceLevels.map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">{messages.memoire.filter}</button>
        </form>

        {items.length === 0 ? <p className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.memoire.noResults}</p> : <MemoryResults tab={tab} items={items} labels={messages.memoire} />}
      </section>
    </div>
  );
}

function MemoryResults({ tab, items, labels }: { tab: MemoryTab; items: Awaited<ReturnType<typeof getMemoryContent>>; labels: ReturnType<typeof getMessages>["memoire"] }) {
  if (tab === "events") return <EventResults items={items as HistoricalEvent[]} />;
  if (tab === "figures") return <FigureResults items={items as HistoricalFigure[]} />;
  if (tab === "archives") return <ArchiveResults items={items as HistoricalArchive[]} labels={labels} />;
  return <DiasporaResults items={items as (DiasporaImpact & { figure: { fullName: string } | null })[]} />;
}

function EventResults({ items }: { items: HistoricalEvent[] }) { return <div className="mt-8 space-y-4">{items.map((item) => <article key={item.id} className="border-l-4 border-emerald-500 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">{item.title}</h2><span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarDays className="h-4 w-4" aria-hidden />{item.period}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p><Traceability level={item.sourceLevel} scope={item.scope} decision={item.relevanceDecision} /></article>)}</div>; }
function FigureResults({ items }: { items: HistoricalFigure[] }) { return <div className="mt-8 grid gap-5 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{item.category}</p><h2 className="mt-2 text-xl font-semibold text-slate-900">{item.fullName}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{item.biography}</p><p className="mt-4 border-l-2 border-emerald-300 pl-3 text-sm leading-6 text-slate-700">{item.mainImpact}</p><Traceability level={item.sourceLevel} scope={item.scope} decision={item.relevanceDecision} /></article>)}</div>; }
function ArchiveResults({ items, labels }: { items: HistoricalArchive[]; labels: ReturnType<typeof getMessages>["memoire"] }) { return <div className="mt-8 grid gap-5 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{item.legalNature}</p><h2 className="mt-2 text-xl font-semibold text-slate-900">{item.title}</h2>{item.actDate && <p className="mt-3 text-sm text-slate-500">{labels.periodLabel}: {item.actDate.toLocaleDateString("fr-FR")}</p>}{item.documentUrl && <a href={item.documentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">{labels.document}</a>}<Traceability level={item.sourceLevel} decision={item.relevanceDecision} /></article>)}</div>; }
function DiasporaResults({ items }: { items: (DiasporaImpact & { figure: { fullName: string } | null })[] }) { return <div className="mt-8 grid gap-5 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{item.domain}</p><h2 className="mt-2 text-xl font-semibold text-slate-900">{item.figure?.fullName ?? `${item.city ? `${item.city}, ` : ""}${item.country}`}</h2><p className="mt-2 text-sm text-slate-500">{item.period}</p><p className="mt-3 text-sm leading-6 text-slate-600">{item.contribution}</p><Traceability level={item.sourceLevel} decision={item.relevanceDecision} /></article>)}</div>; }
