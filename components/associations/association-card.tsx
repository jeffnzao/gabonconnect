import Link from "next/link";
import { HeartHandshake, MapPin } from "lucide-react";
import type { AssociationListItem } from "@/lib/associations";

interface AssociationCardProps {
  association: AssociationListItem;
}

export default function AssociationCard({ association }: AssociationCardProps) {
  return (
    <Link
      href={`/associations/${association.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {association.logo ? (
          // Logos hébergés sur Supabase Storage : domaines non connus à
          // l'avance, on reste sur <img> plutôt que next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={association.logo}
            alt={association.name}
            className="h-12 w-12 shrink-0 rounded-full border border-slate-100 object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <HeartHandshake className="h-5 w-5" aria-hidden />
          </span>
        )}

        <p className="text-sm font-semibold text-slate-900">{association.name}</p>
      </div>

      {association.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
          {association.description}
        </p>
      )}

      {association.city && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
          {association.city.name}, {association.city.country.name}
        </p>
      )}
    </Link>
  );
}
