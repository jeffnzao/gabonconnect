// Fonctions d'accès aux données pour le parcours d'exploration géographique
// (/explore, /explore/[continent], /explore/[continent]/[pays],
// /explore/[continent]/[pays]/[ville]).
//
// Ce module ne doit être importé que depuis des Server Components. Les
// fonctions sont mémoïsées avec React `cache()` : dans une même requête,
// `generateMetadata` et le composant de page peuvent tous les deux appeler
// la même fonction sans déclencher deux allers-retours base de données.

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  ProfileVisibility,
  AssociationStatus,
} from "@/app/generated/prisma";

const PUBLIC_PROFILE = { visibility: ProfileVisibility.PUBLIC } as const;
const APPROVED_ASSOCIATION = { status: AssociationStatus.APPROVED } as const;

// ────────────────────────────────────────────────────────────────
// /explore — vue d'ensemble des continents
// ────────────────────────────────────────────────────────────────

export interface ContinentOverview {
  id: string;
  slug: string;
  name: string;
  code: string;
  countryCount: number;
  cityCount: number;
  publicProfileCount: number;
  approvedAssociationCount: number;
}

/**
 * Tous les continents avec leurs compteurs agrégés. Une seule requête
 * Prisma (imbriquée) pour éviter le pattern N+1 : on descend jusqu'aux
 * villes en un coup puis on agrège en mémoire côté serveur.
 */
export const getExploreOverview = cache(async (): Promise<ContinentOverview[]> => {
  const continents = await prisma.continent.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      code: true,
      countries: {
        select: {
          cities: {
            select: {
              _count: {
                select: {
                  profiles: { where: PUBLIC_PROFILE },
                  associations: { where: APPROVED_ASSOCIATION },
                },
              },
            },
          },
        },
      },
    },
  });

  return continents.map((continent) => {
    const cities = continent.countries.flatMap((country) => country.cities);
    return {
      id: continent.id,
      slug: continent.slug,
      name: continent.name,
      code: continent.code,
      countryCount: continent.countries.length,
      cityCount: cities.length,
      publicProfileCount: cities.reduce((sum, city) => sum + city._count.profiles, 0),
      approvedAssociationCount: cities.reduce(
        (sum, city) => sum + city._count.associations,
        0,
      ),
    };
  });
});

// ────────────────────────────────────────────────────────────────
// /explore/[continentSlug]
// ────────────────────────────────────────────────────────────────

export interface CountryOverview {
  id: string;
  slug: string;
  name: string;
  code: string;
  cityCount: number;
  publicProfileCount: number;
  approvedAssociationCount: number;
}

export interface ContinentDetail {
  id: string;
  slug: string;
  name: string;
  code: string;
  countries: CountryOverview[];
}

export const getContinentBySlug = cache(
  async (continentSlug: string): Promise<ContinentDetail | null> => {
    const continent = await prisma.continent.findUnique({
      where: { slug: continentSlug },
      select: {
        id: true,
        slug: true,
        name: true,
        code: true,
        countries: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            code: true,
            cities: {
              select: {
                _count: {
                  select: {
                    profiles: { where: PUBLIC_PROFILE },
                    associations: { where: APPROVED_ASSOCIATION },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!continent) return null;

    return {
      id: continent.id,
      slug: continent.slug,
      name: continent.name,
      code: continent.code,
      countries: continent.countries.map((country) => ({
        id: country.id,
        slug: country.slug,
        name: country.name,
        code: country.code,
        cityCount: country.cities.length,
        publicProfileCount: country.cities.reduce(
          (sum, city) => sum + city._count.profiles,
          0,
        ),
        approvedAssociationCount: country.cities.reduce(
          (sum, city) => sum + city._count.associations,
          0,
        ),
      })),
    };
  },
);

// ────────────────────────────────────────────────────────────────
// /explore/[continentSlug]/[countrySlug]
// ────────────────────────────────────────────────────────────────

export interface CityOverview {
  id: string;
  slug: string;
  name: string;
  publicProfileCount: number;
  approvedAssociationCount: number;
}

export interface CountryDetail {
  id: string;
  slug: string;
  name: string;
  code: string;
  continent: { slug: string; name: string };
  cityCount: number;
  publicProfileCount: number;
  approvedAssociationCount: number;
  cities: CityOverview[];
}

export const getCountryBySlug = cache(
  async (continentSlug: string, countrySlug: string): Promise<CountryDetail | null> => {
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug },
      select: {
        id: true,
        slug: true,
        name: true,
        code: true,
        continent: { select: { slug: true, name: true } },
        cities: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            _count: {
              select: {
                profiles: { where: PUBLIC_PROFILE },
                associations: { where: APPROVED_ASSOCIATION },
              },
            },
          },
        },
      },
    });

    // Le pays existe mais n'appartient pas au continent de l'URL : on
    // considère la route comme invalide (évite les URLs incohérentes du
    // type /explore/europe/gabon).
    if (!country || country.continent.slug !== continentSlug) return null;

    const cities: CityOverview[] = country.cities.map((city) => ({
      id: city.id,
      slug: city.slug,
      name: city.name,
      publicProfileCount: city._count.profiles,
      approvedAssociationCount: city._count.associations,
    }));

    return {
      id: country.id,
      slug: country.slug,
      name: country.name,
      code: country.code,
      continent: country.continent,
      cityCount: cities.length,
      publicProfileCount: cities.reduce((sum, city) => sum + city.publicProfileCount, 0),
      approvedAssociationCount: cities.reduce(
        (sum, city) => sum + city.approvedAssociationCount,
        0,
      ),
      cities,
    };
  },
);

// ────────────────────────────────────────────────────────────────
// /explore/[continentSlug]/[countrySlug]/[citySlug]
// ────────────────────────────────────────────────────────────────

export interface CityProfile {
  id: string;
  firstName: string;
  lastName: string;
  profession: string | null;
  bio: string | null;
  photo: string | null;
}

export interface CityAssociation {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
}

export interface CityDetail {
  id: string;
  slug: string;
  name: string;
  country: { slug: string; name: string };
  continent: { slug: string; name: string };
  profiles: CityProfile[];
  associations: CityAssociation[];
}

export const getCityBySlug = cache(
  async (
    continentSlug: string,
    countrySlug: string,
    citySlug: string,
  ): Promise<CityDetail | null> => {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: {
        id: true,
        slug: true,
        name: true,
        country: {
          select: {
            slug: true,
            name: true,
            continent: { select: { slug: true, name: true } },
          },
        },
        profiles: {
          where: PUBLIC_PROFILE,
          orderBy: { firstName: "asc" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profession: true,
            bio: true,
            photo: true,
          },
        },
        associations: {
          where: APPROVED_ASSOCIATION,
          orderBy: { name: "asc" },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            logo: true,
          },
        },
      },
    });

    if (
      !city ||
      city.country.slug !== countrySlug ||
      city.country.continent.slug !== continentSlug
    ) {
      return null;
    }

    return {
      id: city.id,
      slug: city.slug,
      name: city.name,
      country: { slug: city.country.slug, name: city.country.name },
      continent: {
        slug: city.country.continent.slug,
        name: city.country.continent.name,
      },
      profiles: city.profiles,
      associations: city.associations,
    };
  },
);