import type { LucideIcon } from "lucide-react";
import { Trees, Landmark, Building, Mountain, Waves, Palmtree } from "lucide-react";
import type { ContinentOverview } from "@/lib/dashboard";

interface ContinentGridProps {
  continents: ContinentOverview[];
}

// Libellé + icône affichés pour chaque code continent (aucune donnée
// statistique ici : les compteurs viennent bien de Prisma).
const CONTINENT_DISPLAY: Record<string, { label: string; icon: LucideIcon }> = {
  AF: { label: "Africa", icon: Trees },
  EU: { label: "Europe", icon: Landmark },
  NA: { label: "North America", icon: Building },
  SA: { label: "South America", icon: Mountain },
  AS: { label: "Asia", icon: Waves },
  OC: { label: "Oceania", icon: Palmtree },
};

// Ordre d'affichage imposé par la spec produit, indépendant de l'ordre
// retourné par la base de données.
const DISPLAY_ORDER = ["AF", "EU", "NA", "SA", "AS", "OC"];

export default function ContinentGrid({ continents }: ContinentGridProps) {
  const byCode = new Map(continents.map((continent) => [continent.code, continent]));

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Explore by continent
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            La diaspora gabonaise est présente sur tous les continents.
            Parcourez la carte du monde gabonais.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {DISPLAY_ORDER.map((code) => {
            const display = CONTINENT_DISPLAY[code];
            const data = byCode.get(code);
            const Icon = display.icon;

            return (
              <button
                key={code}
                type="button"
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-8 text-center transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60 hover:shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:ring-emerald-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {display.label}
                </span>
                <span className="text-xs text-slate-500">
                  {data ? `${data.countryCount} countries` : "Coming soon"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}