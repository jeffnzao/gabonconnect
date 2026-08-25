import { cache } from "react";
import { EventStatus, EventParticipantStatus, Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface EventFilters {
  upcomingOnly?: boolean;
  location?: string;
  associationId?: string;
}

export function isUpcomingEvent(startDate: Date, now = new Date()): boolean {
  return startDate >= now;
}

export function hasEventCapacity(maxParticipants: number | null, goingCount: number): boolean {
  return maxParticipants === null || goingCount < maxParticipants;
}

export function canOrganizeAssociationEvent(hasMembership: boolean): boolean {
  return hasMembership;
}

const PUBLIC_EVENT_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  startDate: true,
  endDate: true,
  location: true,
  isVirtual: true,
  association: { select: { id: true, name: true, slug: true } },
  createdBy: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
  _count: { select: { participants: { where: { status: { not: EventParticipantStatus.DECLINED } } } } },
} satisfies Prisma.EventSelect;

function buildEventWhere(filters: EventFilters): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = { status: EventStatus.PUBLISHED };
  if (filters.upcomingOnly) where.startDate = { gte: new Date() };
  if (filters.location?.trim()) where.location = { contains: filters.location.trim(), mode: "insensitive" };
  if (filters.associationId) where.associationId = filters.associationId;
  return where;
}

export const getEvents = cache(async (filters: EventFilters = {}) => {
  return prisma.event.findMany({
    where: buildEventWhere(filters),
    orderBy: { startDate: "asc" },
    select: PUBLIC_EVENT_SELECT,
  });
});

export const getEventBySlug = cache(async (slug: string) => {
  return prisma.event.findFirst({
    where: { slug, status: EventStatus.PUBLISHED },
    select: {
      ...PUBLIC_EVENT_SELECT,
      virtualUrl: true,
      maxParticipants: true,
      participants: { where: { status: { not: EventParticipantStatus.DECLINED } }, select: { userId: true, status: true } },
    },
  });
});