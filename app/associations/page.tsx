import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import AssociationCard from "@/components/associations/association-card";
import AssociationFilters from "@/components/associations/association-filters";
import AssociationEmptyState from "@/components/associations/association-empty-state";
import { getAssociations, getAssociationFilterOptions } from "@/lib/associations";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Associations Directory | GabonConnect",
  description:
    "Discover Gabonese diaspora associations around the world and connect with your community.",
};

interface AssociationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

function buildPageHref(
  targetPage: number,
  filters: { search?: string; continentSlug?: string; countrySlug?: string },
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.continentSlug) params.set("continent", filters.continentSlug);
  if (filters.countrySlug) params.set("country", filters.countrySlug);
  if (targetPage > 1) params.set("page", String(targetPage));

  const queryString = params.toString();
  return queryString ? `/associations?${queryString}` : "/associations";
}

export default async function AssociationsPage({ searchParams }: AssociationsPageProps) {
  const messages = getMessages(await getLocale());
  const sp = await searchParams;

  const search = first(sp.q);
  const continentSlug = first(sp.continent);
  const countrySlug = first(sp.country);
  const pageParam = first(sp.page);
  const page = pageParam ? Math.max(1, Number.parseInt(pageParam, 10) || 1) : 1;

  const [{ associations, totalCount, totalPages }, filterOptions] = await Promise.all([
    getAssociations({ search, continentSlug, countrySlug, page }),
    getAssociationFilterOptions(),
  ]);

  const hasActiveFilters = Boolean(search || continentSlug || countrySlug);
  const filtersForPagination = { search, continentSlug, countrySlug };

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.members }]} />

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {messages.directories.associations}
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              {messages.directories.associationsIntro}
            </p>
            <p className="mt-3 text-sm font-medium text-emerald-700">
              {totalCount} association{totalCount === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <AssociationFilters
              filterOptions={filterOptions}
              search={search}
              continentSlug={continentSlug}
              countrySlug={countrySlug}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {associations.length === 0 ? (
          <AssociationEmptyState hasActiveFilters={hasActiveFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {associations.map((association) => (
                <AssociationCard key={association.id} association={association} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-12 flex items-center justify-center gap-4 text-sm"
              >
                {page > 1 ? (
                  <Link
                    href={buildPageHref(page - 1, filtersForPagination)}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 font-medium text-slate-300">
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </span>
                )}

                <span className="text-slate-500">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={buildPageHref(page + 1, filtersForPagination)}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 font-medium text-slate-300">
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
