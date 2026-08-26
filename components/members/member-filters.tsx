"use client";

import { useRouter } from "next/navigation";
import type { FilterOption } from "@/lib/members";
import { useMessages } from "@/components/i18n-provider";

interface MemberFiltersProps {
  continents: FilterOption[];
  countries: FilterOption[];
  cities: FilterOption[];
  search?: string;
  continentSlug?: string;
  countrySlug?: string;
  citySlug?: string;
  profession?: string;
}

interface NextFilters {
  continent?: string;
  country?: string;
  city?: string;
  profession?: string;
}

const selectClassName =
  "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export default function MemberFilters({
  continents,
  countries,
  cities,
  search,
  continentSlug,
  countrySlug,
  citySlug,
  profession,
}: MemberFiltersProps) {
  const messages = useMessages();
  const router = useRouter();

  function navigate(next: NextFilters) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const continent = "continent" in next ? next.continent : continentSlug;
    const country = "country" in next ? next.country : countrySlug;
    const city = "city" in next ? next.city : citySlug;
    const nextProfession = "profession" in next ? next.profession : profession;

    if (continent) params.set("continent", continent);
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (nextProfession) params.set("profession", nextProfession);

    const queryString = params.toString();
    router.push(queryString ? `/members?${queryString}` : "/members");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label={messages.home.allContinents}
        value={continentSlug ?? ""}
        onChange={(event) =>
          navigate({ continent: event.target.value || undefined, country: undefined, city: undefined })
        }
        className={selectClassName}
      >
        <option value="">{messages.home.allContinents}</option>
        {continents.map((continent) => (
          <option key={continent.slug} value={continent.slug}>
            {continent.name}
          </option>
        ))}
      </select>

      <select
        aria-label={messages.auth.country}
        value={countrySlug ?? ""}
        disabled={!continentSlug}
        onChange={(event) => navigate({ country: event.target.value || undefined, city: undefined })}
        className={selectClassName}
      >
        <option value="">{messages.auth.country}</option>
        {countries.map((country) => (
          <option key={country.slug} value={country.slug}>
            {country.name}
          </option>
        ))}
      </select>

      <select
        aria-label={messages.auth.city}
        value={citySlug ?? ""}
        disabled={!countrySlug}
        onChange={(event) => navigate({ city: event.target.value || undefined })}
        className={selectClassName}
      >
        <option value="">{messages.auth.city}</option>
        {cities.map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        aria-label={messages.auth.profession}
        defaultValue={profession ?? ""}
        placeholder={messages.auth.profession}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            navigate({ profession: event.currentTarget.value.trim() || undefined });
          }
        }}
        onBlur={(event) =>
          navigate({ profession: event.currentTarget.value.trim() || undefined })
        }
        className={`${selectClassName} w-40`}
      />
    </div>
  );
}
