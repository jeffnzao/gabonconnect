import Link from "next/link";
import type { CountryOverview } from "@/lib/explore";

interface CountryCardProps {
  country: CountryOverview;
  continentSlug: string;
}

export default function CountryCard({ country, continentSlug }: CountryCardProps) {
  return (
    <Link
      href={`/explore/${continentSlug}/${country.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{country.name}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {country.code}
        </span>
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
        <div>
          <dt className="sr-only">Cities</dt>
          <dd>{country.cityCount} cities</dd>
        </div>
        <div>
          <dt className="sr-only">Public profiles</dt>
          <dd>{country.publicProfileCount} public profiles</dd>
        </div>
        <div>
          <dt className="sr-only">Approved associations</dt>
          <dd>{country.approvedAssociationCount} associations</dd>
        </div>
      </dl>
    </Link>
  );
}