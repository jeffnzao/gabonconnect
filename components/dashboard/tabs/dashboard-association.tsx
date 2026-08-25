"use client";

import Link from "next/link";
import type { UserDashboardData } from "@/lib/dashboard";

interface DashboardAssociationProps {
  association: NonNullable<UserDashboardData["association"]>;
}

export default function DashboardAssociation({ association }: DashboardAssociationProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">{association.name}</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-600">Statut de l&apos;association</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{association.status}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-600">Membres</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{association.memberCount}</p>
          </div>

          <div className="mt-6 space-y-2">
            <Link
              href={`/associations/${association.slug}`}
              className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-white hover:bg-emerald-700 font-medium"
            >
              Voir la fiche association
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Actions associatives</h3>
        <p className="text-slate-600">
          Les fonctionnalités de gestion associative (validation des membres, gestion des publications) seront disponibles dans une prochaine mise à jour.
        </p>
      </div>
    </div>
  );
}
