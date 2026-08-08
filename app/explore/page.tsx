import type { Metadata } from "next";
import { Search } from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import ContinentCard from "@/components/explore/continent-card";
import { getExploreOverview } from "@/lib/explore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore the Gabonese Diaspora | GabonConnect",
  description:
    "Explorez les communautés gabonaises à travers les continents, les pays et les villes.",
};

export default async function ExplorePage() {
  const continents = await getExploreOverview();

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Explore" }]} />

          <div className="mx-auto mt-10 max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Explore the Gabonese Diaspora
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Explorez les communautés gabonaises à travers les continents,
              les pays et les villes.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-slate-400">
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <input
              type="text"
              placeholder="Rechercher un pays, une ville…"
              disabled
              className="w-full bg-transparent text-sm text-slate-500 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
            />
            <span className="hidden shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 sm:inline">
              Bientôt disponible
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-xl font-semibold text-slate-900">
          Parcourir par continent
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {continents.map((continent) => (
            <ContinentCard key={continent.id} continent={continent} />
          ))}
        </div>
      </section>
    </div>
  );
}