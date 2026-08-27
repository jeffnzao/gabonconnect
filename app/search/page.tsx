import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  type SearchCategory,
  globalSearch,
  isEmptySearchQuery,
} from "@/lib/search";
import { getLocale, getMessages } from "@/lib/i18n";

const validCategories = [
  "all",
  "members",
  "associations",
  "events",
  "opportunities",
  "posts",
  "procedures",
  "consulates",
] as const satisfies readonly SearchCategory[];

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search | GabonConnect",
  description: "Search across GabonConnect members, associations, and communities.",
};

interface SearchPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const messages = getMessages(await getLocale());
  const params = (await searchParams) ?? {};
  const rawQuery = first(params.q) ?? first(params.search) ?? "";
  const requestedCategory = first(params.category) ?? "all";
  const category: SearchCategory = validCategories.includes(requestedCategory as SearchCategory)
    ? (requestedCategory as SearchCategory)
    : "all";

  if (isEmptySearchQuery(rawQuery)) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600">
            <Search className="h-5 w-5" aria-hidden />
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">{messages.search.label}</p>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            {messages.search.title}
          </h1>

          <p className="mt-4 text-slate-600">
            {messages.search.intro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <Link
              href="/members"
              className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {messages.search.browseMembers}
            </Link>
            <Link
              href="/associations"
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              {messages.search.browseAssociations}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const results = await globalSearch(rawQuery, category, 20);
  const selectedResults = results[category] ?? [];
  const categoryLabels: Record<SearchCategory, string> = {
    all: messages.search.all,
    members: messages.search.members,
    associations: messages.search.associations,
    events: messages.search.events,
    opportunities: messages.search.opportunities,
    posts: messages.search.posts,
    procedures: messages.search.procedures,
    consulates: messages.search.consulates,
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">{messages.search.label}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{messages.search.resultsFor} “{rawQuery}”</h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {validCategories.map((option) => {
          const href = `/search?q=${encodeURIComponent(rawQuery)}&category=${option}`;
          const isActive = option === category;
          return (
            <Link
              key={option}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {categoryLabels[option]}
            </Link>
          );
        })}
      </div>

      {selectedResults.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-600">
          {messages.search.noResults}
        </div>
      ) : (
        <ul className="space-y-4">
          {selectedResults.map((result) => (
            <li key={`${result.kind}-${result.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {result.kind}
                </span>
              </div>
              <Link href={result.href} className="text-lg font-semibold text-slate-900 hover:text-emerald-700">
                {result.title}
              </Link>
              <p className="mt-2 text-sm text-slate-600">{result.subtitle}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
