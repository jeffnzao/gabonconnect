import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import MemberSearch from "@/components/members/member-search";
import MemberFilters from "@/components/members/member-filters";
import MemberCard from "@/components/members/member-card";
import Pagination from "@/components/members/pagination";
import { getMembers, getMemberFilterOptions } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gabonese Members | GabonConnect",
  description:
    "Discover Gabonese people around the world and connect with the diaspora.",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

export default async function MembersPage(props: PageProps<"/members">) {
  const rawParams = await props.searchParams;

  const search = firstValue(rawParams.search);
  const continentSlug = firstValue(rawParams.continent);
  const countrySlug = firstValue(rawParams.country);
  const citySlug = firstValue(rawParams.city);
  const profession = firstValue(rawParams.profession);
  const pageParam = firstValue(rawParams.page);
  const page = pageParam ? Math.max(1, Number.parseInt(pageParam, 10) || 1) : 1;

  const [{ members, totalCount, totalPages }, filterOptions] = await Promise.all([
    getMembers({ search, continentSlug, countrySlug, citySlug, profession, page }),
    getMemberFilterOptions(continentSlug, countrySlug),
  ]);

  const hasActiveFilters = Boolean(search || continentSlug || countrySlug || citySlug || profession);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Gabonese Members
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Discover Gabonese people around the world and connect with the diaspora.
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700">
              <Users className="h-4 w-4" aria-hidden />
              {totalCount} member{totalCount === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-xl justify-center">
            <MemberSearch
              defaultValue={search}
              continentSlug={continentSlug}
              countrySlug={countrySlug}
              citySlug={citySlug}
              profession={profession}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <MemberFilters
              continents={filterOptions.continents}
              countries={filterOptions.countries}
              cities={filterOptions.cities}
              search={search}
              continentSlug={continentSlug}
              countrySlug={countrySlug}
              citySlug={citySlug}
              profession={profession}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {hasActiveFilters ? "Results" : "All members"}
          </h2>
          <p className="text-sm text-slate-500">
            {totalCount} member{totalCount === 1 ? "" : "s"} found
          </p>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="text-base font-medium text-slate-700">No public members found.</p>
            <p className="text-sm text-slate-500">Be the first to join GabonConnect.</p>
            <Link href="/join" className="mt-2 inline-flex items-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400">
              Join GabonConnect
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              search={search}
              continentSlug={continentSlug}
              countrySlug={countrySlug}
              citySlug={citySlug}
              profession={profession}
            />
          </>
        )}
      </section>
    </div>
  );
}