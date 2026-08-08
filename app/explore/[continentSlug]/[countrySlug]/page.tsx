import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import CityCard from "@/components/explore/city-card";
import { getCountryBySlug } from "@/lib/explore";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/explore/[continentSlug]/[countrySlug]">,
): Promise<Metadata> {
  const { continentSlug, countrySlug } = await props.params;
  const country = await getCountryBySlug(continentSlug, countrySlug);

  if (!country) {
    return { title: "Pays introuvable | GabonConnect" };
  }

  return {
    title: `Gabonese Community in ${country.name} | GabonConnect`,
    description: `Discover Gabonese members and associations in ${country.name}.`,
  };
}

export default async function CountryPage(
  props: PageProps<"/explore/[continentSlug]/[countrySlug]">,
) {
  const { continentSlug, countrySlug } = await props.params;
  const country = await getCountryBySlug(continentSlug, countrySlug);

  if (!country) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Explore", href: "/explore" },
              { label: country.continent.name, href: `/explore/${continentSlug}` },
              { label: country.name },
            ]}
          />

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {country.name}
          </h1>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
            <div>
              <dd className="text-lg font-semibold text-slate-900">
                {country.cityCount}
              </dd>
              <dt>cities</dt>
            </div>
            <div>
              <dd className="text-lg font-semibold text-slate-900">
                {country.publicProfileCount}
              </dd>
              <dt>public profiles</dt>
            </div>
            <div>
              <dd className="text-lg font-semibold text-slate-900">
                {country.approvedAssociationCount}
              </dd>
              <dt>approved associations</dt>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-xl font-semibold text-slate-900">Cities</h2>

        {country.cities.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            Aucune ville n&apos;est encore référencée pour ce pays.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {country.cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                continentSlug={continentSlug}
                countrySlug={country.slug}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}