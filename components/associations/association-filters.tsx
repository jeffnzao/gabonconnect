import { Search } from "lucide-react";
import type { AssociationFilterOptions } from "@/lib/associations";

interface AssociationFiltersProps {
  filterOptions: AssociationFilterOptions;
  search?: string;
  continentSlug?: string;
  countrySlug?: string;
}

/**
 * Recherche + filtres continent/pays de l'annuaire des associations.
 *
 * Contrainte de la task : Server Components uniquement, pas de
 * useState/useEffect. Un seul <form method="GET"> natif porte tous les
 * champs — la soumission (bouton, ou touche Entrée dans le champ texte)
 * recharge la page avec la nouvelle query string, que `page.tsx` relit
 * via `searchParams`. Aucune interactivité côté client n'est nécessaire.
 *
 * Le pays n'est pas filtré dynamiquement par continent (ça demanderait du
 * JS) : la liste complète des pays est toujours affichée, simplement
 * regroupée par continent via <optgroup> pour rester scannable.
 */
export default function AssociationFilters({
  filterOptions,
  search,
  continentSlug,
  countrySlug,
}: AssociationFiltersProps) {
  const countriesByContinent = filterOptions.continents.map((continent) => ({
    continent,
    countries: filterOptions.countries.filter(
      (country) => country.continentSlug === continent.slug,
    ),
  }));

  return (
    <form
      action="/associations"
      method="GET"
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <label className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-400 focus-within:border-emerald-300 sm:min-w-[240px]">
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="sr-only">Search associations by name</span>
        <input
          type="text"
          name="q"
          defaultValue={search ?? ""}
          placeholder="Search associations by name…"
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </label>

      <select
        name="continent"
        defaultValue={continentSlug ?? ""}
        aria-label="Filter by continent"
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none"
      >
        <option value="">All continents</option>
        {filterOptions.continents.map((continent) => (
          <option key={continent.slug} value={continent.slug}>
            {continent.name}
          </option>
        ))}
      </select>

      <select
        name="country"
        defaultValue={countrySlug ?? ""}
        aria-label="Filter by country"
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none"
      >
        <option value="">All countries</option>
        {countriesByContinent.map(
          ({ continent, countries }) =>
            countries.length > 0 && (
              <optgroup key={continent.slug} label={continent.name}>
                {countries.map((country) => (
                  <option key={country.slug} value={country.slug}>
                    {country.name}
                  </option>
                ))}
              </optgroup>
            ),
        )}
      </select>

      <button
        type="submit"
        className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
      >
        Apply
      </button>
    </form>
  );
}
