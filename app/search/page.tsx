import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search | GabonConnect",
  description: "Search across GabonConnect members, associations, and communities.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = first(params.q) ?? first(params.search)?.trim() ?? "";

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-emerald-600">
          <Search className="h-5 w-5" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Search</p>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          {query ? `Results for “${query}”` : "Search GabonConnect"}
        </h1>

        {!query ? (
          <p className="mt-4 text-slate-600">
            Use the global search box to look for members, associations, opportunities, and community content.
          </p>
        ) : (
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <p>Search is available across the public directory and community listings.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/members?search=${encodeURIComponent(query)}`}
                className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Browse members
              </Link>
              <Link
                href={`/associations?search=${encodeURIComponent(query)}`}
                className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                Browse associations
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
