import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Trees, Landmark, Building, Mountain, Waves, Palmtree, Globe2 } from "lucide-react";
import type { ContinentOverview } from "@/lib/explore";

// Icône associée à chaque continent (code ISO). Purement visuel : les
// chiffres affichés proviennent tous de `continent`, calculés via Prisma.
const CONTINENT_ICON: Record<string, LucideIcon> = {
  AF: Trees,
  EU: Landmark,
  NA: Building,
  SA: Mountain,
  AS: Waves,
  OC: Palmtree,
};

interface ContinentCardProps {
  continent: ContinentOverview;
}

export default function ContinentCard({ continent }: ContinentCardProps) {
  const Icon = CONTINENT_ICON[continent.code] ?? Globe2;

  return (
    <Link
      href={`/explore/${continent.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
        <Icon className="h-5 w-5" aria-hidden />
      </span>

      <h3 className="text-lg font-semibold text-slate-900">{continent.name}</h3>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <dt className="sr-only">Countries</dt>
          <dd>{continent.countryCount} countries</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="sr-only">Cities</dt>
          <dd>{continent.cityCount} cities</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="sr-only">Public profiles</dt>
          <dd>{continent.publicProfileCount} public profiles</dd>
        </div>
      </dl>
    </Link>
  );
}