// Fonctions d'accès aux données pour l'annuaire public des membres
// (/members, /members/[id]).
//
// Ce module ne doit être importé que depuis des Server Components.
// Sécurité : tous les profils sont filtrés sur `visibility: PUBLIC`, et
// on utilise systématiquement `select` (jamais `include: { user: true }`)
// pour ne jamais exposer les champs internes de `User` (email, role, id
// Supabase Auth) ni de futurs champs sensibles de `Profile`.

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ProfileVisibility, Prisma } from "@/app/generated/prisma/client";

export const MEMBERS_PAGE_SIZE = 12;

// ────────────────────────────────────────────────────────────────
// Filtres géographiques (continent → pays → ville)
// ────────────────────────────────────────────────────────────────

export interface GeoFilterCity {
  slug: string;
  name: string;
}

export interface GeoFilterCountry {
  slug: string;
  name: string;
  cities: GeoFilterCity[];
}

export interface GeoFilterContinent {
  slug: string;
  name: string;
  countries: GeoFilterCountry[];
}

/**
 * Arbre continent → pays → ville, utilisé pour construire les filtres en
 * cascade de l'annuaire. Le jeu de données reste petit (poignée de
 * continents/pays/villes), donc une seule requête imbriquée suffit.
 */
export const getMemberGeoFilters = cache(async (): Promise<GeoFilterContinent[]> => {
  return prisma.continent.findMany({
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      countries: {
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          cities: {
            orderBy: { name: "asc" },
            select: { slug: true, name: true },
          },
        },
      },
    },
  });
});

// ────────────────────────────────────────────────────────────────
// Compteur global (hero de /members)
// ────────────────────────────────────────────────────────────────

export const getPublicMemberCount = cache(async (): Promise<number> => {
  return prisma.profile.count({ where: { visibility: ProfileVisibility.PUBLIC } });
});

// ────────────────────────────────────────────────────────────────
// Recherche + filtres + pagination
// ────────────────────────────────────────────────────────────────

export interface MemberSearchParams {
  q?: string;
  continent?: string;
  country?: string;
  city?: string;
  profession?: string;
  page?: number;
}

export interface MemberLocation {
  name: string;
  slug: string;
  country: {
    name: string;
    slug: string;
    continent: { name: string; slug: string };
  };
}

export interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  profession: string | null;
  photo: string | null;
  city: MemberLocation | null;
}

export interface MemberSearchResult {
  members: MemberSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildMemberWhere(params: MemberSearchParams): Prisma.ProfileWhereInput {
  const and: Prisma.ProfileWhereInput[] = [];

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { profession: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const profession = params.profession?.trim();
  if (profession) {
    and.push({ profession: { contains: profession, mode: "insensitive" } });
  }

  // Le filtre le plus précis disponible l'emporte : pas besoin de
  // combiner continent+pays+ville, la ville implique déjà le pays et le
  // continent (relations imbriquées).
  if (params.city) {
    and.push({ city: { slug: params.city } });
  } else if (params.country) {
    and.push({ city: { country: { slug: params.country } } });
  } else if (params.continent) {
    and.push({ city: { country: { continent: { slug: params.continent } } } });
  }

  return {
    visibility: ProfileVisibility.PUBLIC,
    ...(and.length ? { AND: and } : {}),
  };
}

const MEMBER_SUMMARY_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  profession: true,
  photo: true,
  city: {
    select: {
      name: true,
      slug: true,
      country: {
        select: {
          name: true,
          slug: true,
          continent: { select: { name: true, slug: true } },
        },
      },
    },
  },
} satisfies Prisma.ProfileSelect;

export const getMembers = cache(
  async (params: MemberSearchParams): Promise<MemberSearchResult> => {
    const page = params.page && params.page > 0 ? Math.floor(params.page) : 1;
    const where = buildMemberWhere(params);

    const [members, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * MEMBERS_PAGE_SIZE,
        take: MEMBERS_PAGE_SIZE,
        select: MEMBER_SUMMARY_SELECT,
      }),
      prisma.profile.count({ where }),
    ]);

    return {
      members,
      total,
      page,
      pageSize: MEMBERS_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / MEMBERS_PAGE_SIZE)),
    };
  },
);

// ────────────────────────────────────────────────────────────────
// /members/[id] — profil public
// ────────────────────────────────────────────────────────────────

export interface MemberProfileDetail {
  id: string;
  firstName: string;
  lastName: string;
  profession: string | null;
  bio: string | null;
  photo: string | null;
  city: MemberLocation | null;
}

/**
 * Renvoie un profil UNIQUEMENT s'il est PUBLIC. Un profil PRIVATE (ou un
 * id inexistant) renvoie `null` — à charge de l'appelant de faire
 * `notFound()`. Ne jamais remplacer ce `select` par `include: { user: true }`.
 */
export const getPublicMemberById = cache(
  async (id: string): Promise<MemberProfileDetail | null> => {
    return prisma.profile.findFirst({
      where: { id, visibility: ProfileVisibility.PUBLIC },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profession: true,
        bio: true,
        photo: true,
        city: {
          select: {
            name: true,
            slug: true,
            country: {
              select: {
                name: true,
                slug: true,
                continent: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  },
);
