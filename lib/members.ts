// Fonctions d'accès aux données pour l'annuaire public des membres
// (/members, /members/[id]).
//
// Règle de sécurité stricte : on ne sélectionne JAMAIS `user` en entier
// (email, role, etc.). On ne récupère que les champs `Profile` destinés à
// l'affichage public, via `select` explicite — jamais `include: { user: true }`.
// Les profils PRIVATE ne sont jamais retournés par ces fonctions.

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ProfileVisibility, Prisma } from "@/app/generated/prisma/client";

const PAGE_SIZE = 12;

export interface MemberLocation {
  name: string;
  slug: string;
  country: {
    name: string;
    slug: string;
    continent: { name: string; slug: string };
  };
}

export const LOCATION_SELECT = {
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

export interface MemberFilters {
  search?: string;
  continentSlug?: string;
  countrySlug?: string;
  citySlug?: string;
  profession?: string;
  page?: number;
}

export interface MemberListItem {
  id: string;
  firstName: string;
  lastName: string;
  profession: string | null;
  photo: string | null;
  city: MemberLocation | null;
}

export interface MemberListResult {
  members: MemberListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildMemberWhere(filters: MemberFilters): Prisma.ProfileWhereInput {
  const where: Prisma.ProfileWhereInput = { visibility: ProfileVisibility.PUBLIC };

  const search = filters.search?.trim();
  if (search) {
    // Prénom, nom, profession, et — quand la localisation fait déjà
    // partie des données disponibles — le nom de ville (ex: "Paris").
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { profession: { contains: search, mode: "insensitive" } },
      { city: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const profession = filters.profession?.trim();
  if (profession) {
    where.profession = { contains: profession, mode: "insensitive" };
  }

  if (filters.citySlug) {
    where.city = { slug: filters.citySlug };
  } else if (filters.countrySlug) {
    where.city = { country: { slug: filters.countrySlug } };
  } else if (filters.continentSlug) {
    where.city = { country: { continent: { slug: filters.continentSlug } } };
  }

  return where;
}

export const getMembers = cache(
  async (filters: MemberFilters): Promise<MemberListResult> => {
    const page = Math.max(1, filters.page ?? 1);
    const where = buildMemberWhere(filters);

    const [members, totalCount] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profession: true,
          photo: true,
          city: { select: LOCATION_SELECT },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return {
      members,
      totalCount,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    };
  },
);

export const getPublicMemberCount = cache(async (): Promise<number> => {
  return prisma.profile.count({ where: { visibility: ProfileVisibility.PUBLIC } });
});

export interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profession: string | null;
  photo: string | null;
  city: MemberLocation | null;
}

export const getMemberById = cache(async (id: string): Promise<MemberDetail | null> => {
  const profile = await prisma.profile.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      profession: true,
      photo: true,
      visibility: true,
      city: { select: LOCATION_SELECT },
    },
  });

  if (!profile || profile.visibility !== ProfileVisibility.PUBLIC) {
    return null;
  }

  return {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    bio: profile.bio,
    profession: profile.profession,
    photo: profile.photo,
    city: profile.city,
  };
});

export interface FilterOption {
  slug: string;
  name: string;
}

export interface MemberFilterOptions {
  continents: FilterOption[];
  countries: FilterOption[];
  cities: FilterOption[];
}

export const getMemberFilterOptions = cache(
  async (continentSlug?: string, countrySlug?: string): Promise<MemberFilterOptions> => {
    const [continents, countries, cities] = await Promise.all([
      prisma.continent.findMany({
        orderBy: { name: "asc" },
        select: { slug: true, name: true },
      }),
      continentSlug
        ? prisma.country.findMany({
            where: { continent: { slug: continentSlug } },
            orderBy: { name: "asc" },
            select: { slug: true, name: true },
          })
        : Promise.resolve([]),
      countrySlug
        ? prisma.city.findMany({
            where: { country: { slug: countrySlug } },
            orderBy: { name: "asc" },
            select: { slug: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    return { continents, countries, cities };
  },
);