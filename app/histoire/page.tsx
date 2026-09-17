import type { Metadata } from "next";
import Link from "next/link";
import { Archive, BookOpen, Landmark, Send, UsersRound } from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import { PeriodBadge, SourceBadge } from "@/components/histoire/source-badge";
import {
  DIASPORA_STORIES,
  HISTORICAL_ARCHIVES,
  HISTORICAL_EVENTS,
  HISTORICAL_FIGURES,
  HISTORICAL_PERIODS,
  PERIOD_MAP,
  isPeriodId,
  type PeriodId,
} from "@/lib/histoire";

export const metadata: Metadata = {
  title: "Mémoire & Histoire du Gabon",
  description:
    "Frise chronologique, figures emblématiques, archives et récits de la diaspora : explorez la mémoire vivante du Gabon de la préhistoire à aujourd'hui.",
  alternates: { canonical: "/histoire" },
};

export const dynamic = "force-static";

const TABS = [
  { id: "frise", label: "Frise", Icon: Landmark },
  { id: "figures", label: "Figures", Icon: UsersRound },
  { id: "archives", label: "Archives", Icon: Archive },
  { id: "diaspora", label: "Diaspora", Icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTab(value: string | undefined): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

type HistoirePageProps = {
  searchParams: Promise<{ tab?: string; periode?: string }>;
};

function buildHref(tab: TabId, periode?: PeriodId): string {
  const params = new URLSearchParams({ tab });
  if (periode) params.set("periode", periode);
  return `/histoire?${params.toString()}`;
}

export default async function HistoirePage({ searchParams }: HistoirePageProps) {
  const params = await searchParams;
  const tab: TabId = isTab(params.tab) ? params.tab : "frise";
  const periode: PeriodId | undefined = isPeriodId(params.periode) ? params.periode : undefined;

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="relative overflow-hidden bg-slate-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(5,150,105,0.25),_transparent_55%)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
          <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Mémoire & Histoire" }]} />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Phase 5 · Mémoire du Gabon
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Mémoire &amp; Histoire du Gabon
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            De la préhistoire à l&apos;époque contemporaine : parcourez la frise chronologique,
            découvrez les figures qui ont façonné le pays et transmettez la mémoire vivante de
            la diaspora.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <nav aria-label="Sections mémoire" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <Link
                key={id}
                href={buildHref(id, periode)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-500 bg-emerald-500 text-slate-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        {tab === "frise" && <TimelineSection tab={tab} periode={periode} />}
        {tab === "figures" && <FiguresSection periode={periode} />}
        {tab === "archives" && <ArchivesSection periode={periode} />}
        {tab === "diaspora" && <DiasporaSection />}
      </section>
    </div>
  );
}

function PeriodFilter({ tab, periode }: { tab: TabId; periode?: PeriodId }) {
  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Filtrer par période
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={buildHref(tab)}
          aria-current={!periode ? "true" : undefined}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            !periode
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
          }`}
        >
          Toutes
        </Link>
        {HISTORICAL_PERIODS.map((period) => {
          const active = periode === period.id;
          return (
            <Link
              key={period.id}
              href={buildHref(tab, period.id)}
              aria-current={active ? "true" : undefined}
              title={`${period.label} · ${period.timespan}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-emerald-500 bg-emerald-500 text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
              }`}
            >
              {period.id} · {period.label}
            </Link>
          );
        })}
      </div>
      {periode && (
        <p className="mt-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{PERIOD_MAP[periode].timespan}</span>{" "}
          — {PERIOD_MAP[periode].summary}
        </p>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
      Aucun contenu pour cette période. Choisissez une autre période ou affichez toutes les entrées.
    </p>
  );
}

function TimelineSection({ tab, periode }: { tab: TabId; periode?: PeriodId }) {
  const events = periode
    ? HISTORICAL_EVENTS.filter((event) => event.period === periode)
    : HISTORICAL_EVENTS;

  return (
    <>
      <PeriodFilter tab={tab} periode={periode} />
      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <ol className="mt-8 space-y-4 border-l-2 border-slate-200 pl-6">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
              />
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-emerald-600">{event.year}</span>
                    <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>
                  </div>
                  <SourceBadge level={event.sourceLevel} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
                <div className="mt-4">
                  <PeriodBadge period={event.period} />
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function FiguresSection({ periode }: { periode?: PeriodId }) {
  const figures = periode
    ? HISTORICAL_FIGURES.filter((figure) => figure.period === periode)
    : HISTORICAL_FIGURES;

  return (
    <>
      <PeriodFilter tab="figures" periode={periode} />
      {figures.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {figures.map((figure) => (
            <article key={figure.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{figure.fullName}</h2>
                  <p className="mt-1 text-sm font-medium text-emerald-700">{figure.role}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{figure.lifespan}</p>
                </div>
                <SourceBadge level={figure.sourceLevel} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{figure.biography}</p>
              <p className="mt-4 border-l-2 border-emerald-300 pl-3 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-900">Héritage : </span>
                {figure.legacy}
              </p>
              <div className="mt-4">
                <PeriodBadge period={figure.period} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function ArchivesSection({ periode }: { periode?: PeriodId }) {
  const archives = periode
    ? HISTORICAL_ARCHIVES.filter((archive) => archive.period === periode)
    : HISTORICAL_ARCHIVES;

  return (
    <>
      <PeriodFilter tab="archives" periode={periode} />
      {archives.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {archives.map((archive) => (
            <article key={archive.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {archive.nature}
                </p>
                <SourceBadge level={archive.sourceLevel} />
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{archive.title}</h2>
              <p className="mt-2 text-xs text-slate-500">Réf. : {archive.reference}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{archive.description}</p>
              <div className="mt-4">
                <PeriodBadge period={archive.period} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function DiasporaSection() {
  return (
    <>
      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Transmettez votre récit</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          La mémoire du Gabon se construit aussi loin de ses frontières. Partagez un souvenir,
          une histoire de famille ou un témoignage : ces récits enrichissent la mémoire vivante
          de la communauté.
        </p>
        <Link
          href="/join"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          <Send className="h-4 w-4" aria-hidden />
          Proposer un récit
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {DIASPORA_STORIES.map((story) => (
          <article key={story.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{story.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {story.author} · {story.location}
                </p>
              </div>
              <SourceBadge level={story.sourceLevel} />
            </div>
            <blockquote className="mt-4 border-l-2 border-emerald-300 pl-3 text-sm italic leading-6 text-slate-700">
              {story.excerpt}
            </blockquote>
          </article>
        ))}
      </div>
    </>
  );
}
