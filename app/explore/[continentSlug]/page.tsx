import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import CountryCard from "@/components/explore/country-card";
import { getContinentBySlug } from "@/lib/explore";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/explore/[continentSlug]">,
): Promise<Metadata> {
  const { continentSlug } = await props.params;
  const continent = await getContinentBySlug(continentSlug);

  if (!continent) {
    return { title: "Continent introuvable | GabonConnect" };
  }

  return {
    title: `Gabonese Community in ${continent.name} | GabonConnect`,
    description: `Discover Gabonese members and associations across ${continent.name}.`,
  };
}

export default async function ContinentPage(
  props: PageProps<"/explore/[continentSlug]">,
) {
  const { continentSlug } = await props.params;
  const continent = await getContinentBySlug(continentSlug);

  if (!continent) {
    notFound();
  }

  const totalCities = continent.countries.reduce((sum, c) => sum + c.cityCount, 0);
  const totalProfiles = continent.countries.reduce(
    (sum, c) => sum + c.publicProfileCount,
    0,
  );
  const totalAssociations = continent.countries.reduce(
    (sum, c) => sum + c.approvedAssociationCount,
    0,
  );

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Explore", href: "/explore" },
              { label: continent.name },
            ]}
          />

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {continent.name}
          </h1>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
            <div>
              <dd className="text-lg font-semibold text-slate-900">
                {continent.countries.length}
              </dd>
              <dt>countries</dt>
            </div>
            <div>
              <dd className="text-lg font-semibold text-slate-900">{totalCities}</dd>
              <dt>cities</dt>
            </div>
            <div>
              <dd className="text-lg font-semibold text-slate-900">{totalProfiles}</dd>
              <dt>public profiles</dt>
            </div>
            <div>
              <dd className="text-lg font-semibold text-slate-900">
                {totalAssociations}
              </dd>
              <dt>approved associations</dt>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-xl font-semibold text-slate-900">Countries</h2>

        {continent.countries.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            Aucun pays n&apos;est encore référencé pour ce continent.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {continent.countries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                continentSlug={continent.slug}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}