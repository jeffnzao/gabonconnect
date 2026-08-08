// Fonctions d'accès aux données pour la landing page GabonConnect.
// Ce module ne doit être importé que depuis des Server Components :
// il utilise le client Prisma directement (connexion base de données).

import { prisma } from "@/lib/prisma";
import {
  ProfileVisibility,
  AssociationStatus,
} from "@/app/generated/prisma/client";

export interface GlobalStats {
  continents: number;
  countries: number;
  cities: number;
  publicProfiles: number;
  approvedAssociations: number;
}

/**
 * Statistiques globales affichées dans la section Hero / Stats.
 * Chaque compteur correspond à une requête `count` Prisma indépendante,
 * exécutée en parallèle.
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const [continents, countries, cities, publicProfiles, approvedAssociations] =
    await Promise.all([
      prisma.continent.count(),
      prisma.country.count(),
      prisma.city.count(),
      prisma.profile.count({ where: { visibility: ProfileVisibility.PUBLIC } }),
      prisma.association.count({ where: { status: AssociationStatus.APPROVED } }),
    ]);

  return { continents, countries, cities, publicProfiles, approvedAssociations };
}

export interface ContinentOverview {
  code: string;
  slug: string;
  name: string;
  countryCount: number;
}

/**
 * Liste des continents avec le nombre de pays rattachés, utilisée par la
 * section "Explore by continent". Les libellés anglais affichés dans l'UI
 * sont dérivés du code ISO du continent (voir components/continent-grid.tsx),
 * seuls les compteurs proviennent réellement de la base.
 */
export async function getContinentsOverview(): Promise<ContinentOverview[]> {
  const continents = await prisma.continent.findMany({
    select: {
      code: true,
      slug: true,
      name: true,
      _count: { select: { countries: true } },
    },
    orderBy: { name: "asc" },
  });

  return continents.map((continent: (typeof continents)[number]) => ({
    code: continent.code,
    slug: continent.slug,
    name: continent.name,
    countryCount: continent._count.countries,
  }));
}