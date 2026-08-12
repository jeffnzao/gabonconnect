import { Search } from "lucide-react";

interface MemberSearchProps {
  defaultValue?: string;
  continentSlug?: string;
  countrySlug?: string;
  citySlug?: string;
  profession?: string;
}

export default function MemberSearch({
  defaultValue,
  continentSlug,
  countrySlug,
  citySlug,
  profession,
}: MemberSearchProps) {
  return (
    <form
      action="/members"
      method="GET"
      className="flex w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm"
    >
      <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder="Search by first name, last name or profession…"
        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      {continentSlug && <input type="hidden" name="continent" value={continentSlug} />}
      {countrySlug && <input type="hidden" name="country" value={countrySlug} />}
      {citySlug && <input type="hidden" name="city" value={citySlug} />}
      {profession && <input type="hidden" name="profession" value={profession} />}
      <button
        type="submit"
        className="shrink-0 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
      >
        Search
      </button>
    </form>
  );
}
