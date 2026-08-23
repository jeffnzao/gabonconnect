// Fonctions d'accès aux données pour l'annuaire public des associations
// (/associations).
//
// Règle de sécurité/qualité : uniquement `status: APPROVED` est jamais
// retourné par ces fonctions — une association PENDING ou REJECTED n'est
// jamais exposée publiquement, quels que soient les filtres actifs.
// `select` explicite à chaque requête (jamais `include` non borné).

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { AssociationStatus, Prisma } from "@/app/generated/prisma";

const PAGE_SIZE = 12;

// ────────────────────────────────────────────────────────────────
// Localisation (City → Country → Continent) — même forme que
// lib/members.ts, redéfinie ici pour garder ce module autonome
// (Association et Profile sont deux domaines distincts).
// ────────────────────────────────────────────────────────────────

export interface AssociationLocation {
  name: string;
  slug: string;
  country: {
    name: string;
    slug: string;
    continent: { name: string; slug: string };
  };
}

const LOCATION_SELECT = {
  name: true,
  slug: true,
  country: {
    select: {
      name: true,
      slug: true,
      continent: { select: { name: true, slug: true } },
    },
  },
} as const;

// ────────────────────────────────────────────────────────────────
// Recherche + filtres + pagination
// ────────────────────────────────────────────────────────────────

export interface AssociationFilters {
  search?: string;
  continentSlug?: string;
  countrySlug?: string;
  page?: number;
}

export interface AssociationListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  city: AssociationLocation | null;
}

export interface AssociationListResult {
  associations: AssociationListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildAssociationWhere(filters: AssociationFilters): Prisma.AssociationWhereInput {
  const where: Prisma.AssociationWhereInput = { status: AssociationStatus.APPROVED };

  const search = filters.search?.trim();
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  // Le pays, s'il est fourni, est le filtre le plus précis — inutile de
  // combiner avec le continent puisque le pays l'implique déjà.
  if (filters.countrySlug) {
    where.city = { country: { slug: filters.countrySlug } };
  } else if (filters.continentSlug) {
    where.city = { country: { continent: { slug: filters.continentSlug } } };
  }

  return where;
}

const ASSOCIATION_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  logo: true,
  city: { select: LOCATION_SELECT },
} satisfies Prisma.AssociationSelect;

export const getAssociations = cache(
  async (filters: AssociationFilters): Promise<AssociationListResult> => {
    const page = filters.page && filters.page > 0 ? Math.floor(filters.page) : 1;
    const where = buildAssociationWhere(filters);

    const [associations, totalCount] = await Promise.all([
      prisma.association.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: ASSOCIATION_SELECT,
      }),
      prisma.association.count({ where }),
    ]);

    return {
      associations,
      totalCount,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    };
  },
);

// ────────────────────────────────────────────────────────────────
// Options de filtres (continent, pays)
//
// Pas de cascade JS ici (contrainte de la task : Server Components
// uniquement, pas de useState/useEffect) : on renvoie systématiquement la
// liste COMPLÈTE des pays, chacun porteur de son continent, pour que
// `association-filters.tsx` puisse les regrouper visuellement par
// continent via de simples <optgroup> — sans dépendre de JS pour filtrer
// dynamiquement les options au changement de continent.
// ────────────────────────────────────────────────────────────────

export interface FilterOption {
  slug: string;
  name: string;
}

export interface AssociationCountryOption extends FilterOption {
  continentSlug: string;
  continentName: string;
}

export interface AssociationFilterOptions {
  continents: FilterOption[];
  countries: AssociationCountryOption[];
}

export const getAssociationFilterOptions = cache(
  async (): Promise<AssociationFilterOptions> => {
    const [continents, countries] = await Promise.all([
      prisma.continent.findMany({
        orderBy: { name: "asc" },
        select: { slug: true, name: true },
      }),
      prisma.country.findMany({
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          continent: { select: { slug: true, name: true } },
        },
      }),
    ]);

    return {
      continents,
      countries: countries.map((country) => ({
        slug: country.slug,
        name: country.name,
        continentSlug: country.continent.slug,
        continentName: country.continent.name,
      })),
    };
  },
);
