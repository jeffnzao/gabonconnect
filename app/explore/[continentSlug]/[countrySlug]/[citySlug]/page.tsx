import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, HeartHandshake } from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import MemberCard from "@/components/explore/member-card";
import AssociationCard from "@/components/explore/association-card";
import { getCityBySlug } from "@/lib/explore";

export const dynamic = "force-dynamic";

interface CityPageProps {
  params: Promise<{
    continentSlug: string;
    countrySlug: string;
    citySlug: string;
  }>;
}

export async function generateMetadata(
  props: CityPageProps,
): Promise<Metadata> {
  const { continentSlug, countrySlug, citySlug } = await props.params;
  const city = await getCityBySlug(continentSlug, countrySlug, citySlug);

  if (!city) {
    return { title: "Ville introuvable | GabonConnect" };
  }

  return {
    title: `Gabonese Community in ${city.name} | GabonConnect`,
    description: `Discover Gabonese members and associations in ${city.name}.`,
  };
}

export default async function CityPage(
  props: CityPageProps,
) {
  const { continentSlug, countrySlug, citySlug } = await props.params;
  const city = await getCityBySlug(continentSlug, countrySlug, citySlug);

  if (!city) {
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
              { label: city.continent.name, href: `/explore/${continentSlug}` },
              {
                label: city.country.name,
                href: `/explore/${continentSlug}/${countrySlug}`,
              },
              { label: city.name },
            ]}
          />

          <h1 className="mt-6 flex items-center gap-2 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            <span aria-hidden>📍</span>
            {city.name}
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <section aria-labelledby="city-stats-heading" className="mb-16">
          <h2 id="city-stats-heading" className="text-xl font-semibold text-slate-900">
            📊 Statistiques
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:w-fit lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
              <dd className="text-2xl font-semibold text-slate-900">
                {city.profiles.length}
              </dd>
              <dt className="text-sm text-slate-500">public members</dt>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
              <dd className="text-2xl font-semibold text-slate-900">
                {city.associations.length}
              </dd>
              <dt className="text-sm text-slate-500">approved associations</dt>
            </div>
          </dl>
        </section>

        <section aria-labelledby="city-members-heading" className="mb-16">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="city-members-heading"
              className="flex items-center gap-2 text-xl font-semibold text-slate-900"
            >
              <Users className="h-5 w-5 text-emerald-600" aria-hidden />
              Gabonese in {city.name}
            </h2>

            <Link
              href={`/members?continent=${continentSlug}&country=${countrySlug}&city=${citySlug}`}
              className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              View all members
            </Link>
          </div>

          {city.profiles.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              Aucun profil public n&apos;est encore visible à {city.name}. Soyez le
              premier à rejoindre la communauté.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {city.profiles.map((profile) => (
                <MemberCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="city-associations-heading">
          <h2
            id="city-associations-heading"
            className="flex items-center gap-2 text-xl font-semibold text-slate-900"
          >
            <HeartHandshake className="h-5 w-5 text-emerald-600" aria-hidden />
            Associations
          </h2>

          {city.associations.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              Aucune association approuvée n&apos;est encore référencée à{" "}
              {city.name}.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {city.associations.map((association) => (
                <AssociationCard key={association.id} association={association} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}