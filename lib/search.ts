import { cache } from "react";
import {
  AssociationStatus,
  EventStatus,
  OpportunityStatus,
  PostVisibility,
  Prisma,
  ProfileVisibility,
} from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export type SearchCategory = "all" | "members" | "associations" | "events" | "opportunities" | "posts";

export interface SearchResult {
  kind: Exclude<SearchCategory, "all">;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface SearchResults {
  all: SearchResult[];
  members: SearchResult[];
  associations: SearchResult[];
  events: SearchResult[];
  opportunities: SearchResult[];
  posts: SearchResult[];
}

export function normalizeSearchQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

export function isEmptySearchQuery(query: string): boolean {
  return normalizeSearchQuery(query).length === 0;
}

export function isPublicSearchCandidate(
  kind: Exclude<SearchCategory, "all">,
  visibility?: string | null,
  status?: string | null,
): boolean {
  if (kind === "members") return visibility === String(ProfileVisibility.PUBLIC);
  if (kind === "associations") return status === String(AssociationStatus.APPROVED);
  if (kind === "events") return status === String(EventStatus.PUBLISHED);
  if (kind === "opportunities") return status === String(OpportunityStatus.PUBLISHED);
  if (kind === "posts") return visibility === String(PostVisibility.PUBLIC);
  return true;
}

export function getSearchCategoryLabel(category: SearchCategory): string {
  const labels: Record<SearchCategory, string> = {
    all: "All",
    members: "Members",
    associations: "Associations",
    events: "Events",
    opportunities: "Opportunities",
    posts: "Posts",
  };
  return labels[category];
}

export const globalSearch = cache(async (
  query: string,
  category: SearchCategory = "all",
  limit = 5,
): Promise<SearchResults> => {
  const term = normalizeSearchQuery(query);
  const empty: SearchResults = {
    all: [],
    members: [],
    associations: [],
    events: [],
    opportunities: [],
    posts: [],
  };

  if (isEmptySearchQuery(term)) {
    return empty;
  }

  const memberWhere: Prisma.ProfileWhereInput = {
    visibility: ProfileVisibility.PUBLIC,
    OR: [
      { firstName: { contains: term, mode: "insensitive" } },
      { lastName: { contains: term, mode: "insensitive" } },
      { bio: { contains: term, mode: "insensitive" } },
      { profession: { contains: term, mode: "insensitive" } },
      { city: { name: { contains: term, mode: "insensitive" } } },
    ],
  };

  const associationWhere: Prisma.AssociationWhereInput = {
    status: AssociationStatus.APPROVED,
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { city: { name: { contains: term, mode: "insensitive" } } },
      { city: { country: { name: { contains: term, mode: "insensitive" } } } },
    ],
  };

  const eventWhere: Prisma.EventWhereInput = {
    status: EventStatus.PUBLISHED,
    startDate: { gte: new Date() },
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { location: { contains: term, mode: "insensitive" } },
      { association: { name: { contains: term, mode: "insensitive" } } },
    ],
  };

  const opportunityWhere: Prisma.OpportunityWhereInput = {
    status: OpportunityStatus.PUBLISHED,
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { location: { contains: term, mode: "insensitive" } },
      { companyName: { contains: term, mode: "insensitive" } },
      { association: { name: { contains: term, mode: "insensitive" } } },
    ],
  };

  const postWhere: Prisma.PostWhereInput = {
    visibility: PostVisibility.PUBLIC,
    OR: [
      { content: { contains: term, mode: "insensitive" } },
      { association: { name: { contains: term, mode: "insensitive" } } },
      { author: { profile: { firstName: { contains: term, mode: "insensitive" } } } },
      { author: { profile: { lastName: { contains: term, mode: "insensitive" } } } },
    ],
  };

  const [members, associations, events, opportunities, posts] = await Promise.all([
    prisma.profile.findMany({
      where: memberWhere,
      take: limit,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profession: true,
        photo: true,
        city: { select: { name: true, country: { select: { name: true } } } },
      },
    }),
    prisma.association.findMany({
      where: associationWhere,
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        city: { select: { name: true, country: { select: { name: true } } } },
      },
    }),
    prisma.event.findMany({
      where: eventWhere,
      take: limit,
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        location: true,
      },
    }),
    prisma.opportunity.findMany({
      where: opportunityWhere,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        type: true,
      },
    }),
    prisma.post.findMany({
      where: postWhere,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { profile: { select: { firstName: true, lastName: true } } } },
      },
    }),
  ]);

  const mappedMembers: SearchResult[] = members.map((member) => ({
    kind: "members",
    id: member.id,
    title: `${member.firstName} ${member.lastName}`,
    subtitle: member.profession ?? member.city?.name ?? "Member profile",
    href: `/members/${member.id}`,
  }));

  const mappedAssociations: SearchResult[] = associations.map((association) => ({
    kind: "associations",
    id: association.id,
    title: association.name,
    subtitle: association.city?.name ?? "Association",
    href: `/associations/${association.slug}`,
  }));

  const mappedEvents: SearchResult[] = events.map((event) => ({
    kind: "events",
    id: event.id,
    title: event.title,
    subtitle: `${new Date(event.startDate).toLocaleDateString("en-US")} · ${event.location}`,
    href: `/events/${event.slug}`,
  }));

  const mappedOpportunities: SearchResult[] = opportunities.map((opportunity) => ({
    kind: "opportunities",
    id: opportunity.id,
    title: opportunity.title,
    subtitle: `${opportunity.type.replace("_", " ")} · ${opportunity.location}`,
    href: `/opportunities/${opportunity.slug}`,
  }));

  const mappedPosts: SearchResult[] = posts.map((post) => ({
    kind: "posts",
    id: post.id,
    title:
      post.content.length > 80
        ? `${post.content.slice(0, 80).trim()}…`
        : post.content,
    subtitle: `By ${post.author.profile ? `${post.author.profile.firstName} ${post.author.profile.lastName}` : "member"}`,
    href: "/feed",
  }));

  const results: SearchResults = {
    all: [...mappedMembers, ...mappedAssociations, ...mappedEvents, ...mappedOpportunities, ...mappedPosts],
    members: mappedMembers,
    associations: mappedAssociations,
    events: mappedEvents,
    opportunities: mappedOpportunities,
    posts: mappedPosts,
  };

  if (category !== "all") {
    const selected = results[category];
    return {
      ...results,
      all: selected,
    };
  }

  return results;
});
