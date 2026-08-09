"use client";

import { useRouter } from "next/navigation";
import type { FilterOption } from "@/lib/members";

interface MemberFiltersProps {
  continents: FilterOption[];
  countries: FilterOption[];
  cities: FilterOption[];
  q?: string;
  continentSlug?: string;
  countrySlug?: string;
  citySlug?: string;
}

interface NextFilters {
  continent?: string;
  country?: string;
  city?: string;
}

const selectClassName =
  "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export default function MemberFilters({
  continents,
  countries,
  cities,
  q,
  continentSlug,
  countrySlug,
  citySlug,
}: MemberFiltersProps) {
  const router = useRouter();

  function navigate(next: NextFilters) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    const continent = "continent" in next ? next.continent : continentSlug;
    const country = "country" in next ? next.country : countrySlug;
    const city = "city" in next ? next.city : citySlug;

    if (continent) params.set("continent", continent);
    if (country) params.set("country", country);
    if (city) params.set("city", city);

    const queryString = params.toString();
    router.push(queryString ? `/members?${queryString}` : "/members");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Filter by continent"
        value={continentSlug ?? ""}
        onChange={(event) =>
          navigate({ continent: event.target.value || undefined, country: undefined, city: undefined })
        }
        className={selectClassName}
      >
        <option value="">All continents</option>
        {continents.map((continent) => (
          <option key={continent.slug} value={continent.slug}>
            {continent.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by country"
        value={countrySlug ?? ""}
        disabled={!continentSlug}
        onChange={(event) => navigate({ country: event.target.value || undefined, city: undefined })}
        className={selectClassName}
      >
        <option value="">All countries</option>
        {countries.map((country) => (
          <option key={country.slug} value={country.slug}>
            {country.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by city"
        value={citySlug ?? ""}
        disabled={!countrySlug}
        onChange={(event) => navigate({ city: event.target.value || undefined })}
        className={selectClassName}
      >
        <option value="">All cities</option>
        {cities.map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
}