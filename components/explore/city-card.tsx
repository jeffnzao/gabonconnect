import Link from "next/link";
import { MapPin } from "lucide-react";
import type { CityOverview } from "@/lib/explore";

interface CityCardProps {
  city: CityOverview;
  continentSlug: string;
  countrySlug: string;
}

export default function CityCard({ city, continentSlug, countrySlug }: CityCardProps) {
  return (
    <Link
      href={`/explore/${continentSlug}/${countrySlug}/${city.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <MapPin className="h-4 w-4" aria-hidden />
      </span>

      <h3 className="text-base font-semibold text-slate-900">{city.name}</h3>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
        <div>
          <dt className="sr-only">Public profiles</dt>
          <dd>{city.publicProfileCount} public profiles</dd>
        </div>
        <div>
          <dt className="sr-only">Approved associations</dt>
          <dd>{city.approvedAssociationCount} associations</dd>
        </div>
      </dl>
    </Link>
  );
}