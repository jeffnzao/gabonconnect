import { HeartHandshake } from "lucide-react";

interface AssociationEmptyStateProps {
  hasActiveFilters: boolean;
}

export default function AssociationEmptyState({
  hasActiveFilters,
}: AssociationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
      <HeartHandshake className="h-8 w-8 text-slate-300" aria-hidden />
      <p className="text-lg font-medium text-slate-900">No associations found.</p>
      <p className="max-w-sm text-sm text-slate-500">
        {hasActiveFilters
          ? "Try a different search term or clear your filters."
          : "There are no approved associations to show yet."}
      </p>
    </div>
  );
}
