// Fonctions d'accès aux données pour la landing page et user dashboard GabonConnect.
// Ce module ne doit être importé que depuis des Server Components :
// il utilise le client Prisma directement (connexion base de données).

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  ProfileVisibility,
  AssociationStatus,
} from "@/app/generated/prisma";

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

// ============================================================================
// USER DASHBOARD DATA — Task 016
// ============================================================================

export interface UserDashboardData {
  profile: {
    firstName: string;
    lastName: string;
    photo: string | null;
    status: string;
    showStatus: boolean;
  };
  stats: {
    articlesCount: number;
    shopsCount: number;
    eventsCount: number;
    opportunitiesCount: number;
    postsCount: number;
    associationCount: number;
  };
  events: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    startDate: Date;
    participantCount: number;
  }>;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    publishedAt: Date | null;
  }>;
  shops: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    slug: string;
    type: string;
    status: string;
    applicationCount: number;
  }>;
  posts: Array<{
    id: string;
    content: string;
    visibility: string;
    createdAt: Date;
    likeCount: number;
    commentCount: number;
  }>;
  association: {
    id: string;
    name: string;
    slug: string;
    status: string;
    memberCount: number;
  } | null;
}

export const getUserDashboardData = cache(async (userId: string): Promise<UserDashboardData | null> => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      photo: true,
      status: true,
      showStatus: true,
    },
  });

  if (!profile) return null;

  const [articlesCreated, shopsCreated, eventsCreated, opportunitiesCreated, postsCreated, associationMemberships] = await Promise.all([
    prisma.article.findMany({
      where: { authorId: userId },
      select: { id: true, title: true, slug: true, status: true, publishedAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shop.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, slug: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.event.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        startDate: true,
        _count: { select: { participants: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.opportunity.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        content: true,
        visibility: true,
        createdAt: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.associationMember.findMany({
      where: { profile: { userId } },
      select: {
        association: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            _count: { select: { members: true } },
          },
        },
      },
    }),
  ]);

  let association: UserDashboardData["association"] = null;
  if (associationMemberships.length > 0) {
    const assoc = associationMemberships[0].association;
    association = {
      id: assoc.id,
      name: assoc.name,
      slug: assoc.slug,
      status: assoc.status,
      memberCount: assoc._count.members,
    };
  }

  return {
    profile,
    stats: {
      articlesCount: articlesCreated.length,
      shopsCount: shopsCreated.length,
      eventsCount: eventsCreated.length,
      opportunitiesCount: opportunitiesCreated.length,
      postsCount: postsCreated.length,
      associationCount: associationMemberships.length,
    },
    events: eventsCreated.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      status: e.status,
      startDate: e.startDate,
      participantCount: e._count.participants,
    })),
    articles: articlesCreated.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      publishedAt: article.publishedAt,
    })),
    shops: shopsCreated.map((shop) => ({
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      status: shop.status,
    })),
    opportunities: opportunitiesCreated.map((o) => ({
      id: o.id,
      title: o.title,
      slug: o.slug,
      type: o.type,
      status: o.status,
      applicationCount: o._count.applications,
    })),
    posts: postsCreated.map((p) => ({
      id: p.id,
      content: p.content,
      visibility: p.visibility,
      createdAt: p.createdAt,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    })),
    association,
  };
});

export async function verifyResourceOwnership(
  resourceId: string,
  userId: string,
  resourceType: "event" | "opportunity" | "post"
): Promise<boolean> {
  if (resourceType === "event") {
    const resource = await prisma.event.findUnique({
      where: { id: resourceId },
      select: { createdById: true },
    });
    return resource?.createdById === userId;
  } else if (resourceType === "opportunity") {
    const resource = await prisma.opportunity.findUnique({
      where: { id: resourceId },
      select: { createdById: true },
    });
    return resource?.createdById === userId;
  } else if (resourceType === "post") {
    const resource = await prisma.post.findUnique({
      where: { id: resourceId },
      select: { authorId: true },
    });
    return resource?.authorId === userId;
  }

  return false;
}

export async function verifyAssociationMembership(associationId: string, userId: string): Promise<boolean> {
  const member = await prisma.associationMember.findFirst({
    where: {
      associationId,
      profile: { userId },
    },
    select: { id: true },
  });

  return !!member;
}