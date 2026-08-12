import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  search?: string;
  continentSlug?: string;
  countrySlug?: string;
  citySlug?: string;
  profession?: string;
}

function buildHref(
  targetPage: number,
  { search, continentSlug, countrySlug, citySlug, profession }: Omit<PaginationProps, "page" | "totalPages">,
) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (continentSlug) params.set("continent", continentSlug);
  if (countrySlug) params.set("country", countrySlug);
  if (citySlug) params.set("city", citySlug);
  if (profession) params.set("profession", profession);
  if (targetPage > 1) params.set("page", String(targetPage));

  const queryString = params.toString();
  return queryString ? `/members?${queryString}` : "/members";
}

export default function Pagination({
  page,
  totalPages,
  search,
  continentSlug,
  countrySlug,
  citySlug,
  profession,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const filters = { search, continentSlug, countrySlug, citySlug, profession };
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
      {hasPrevious ? (
        <Link href={buildHref(page - 1, filters)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 px-4 py-2 text-sm font-medium text-slate-300">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </span>
      )}

      <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>

      {hasNext ? (
        <Link href={buildHref(page + 1, filters)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700">
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 px-4 py-2 text-sm font-medium text-slate-300">
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
