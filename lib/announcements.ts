import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { AnnouncementStatus, AnnouncementTargetType } from "@/app/generated/prisma";

export interface AnnouncementContext {
  associationId?: string;
  continentSlug?: string;
  countrySlug?: string;
  citySlug?: string;
}

export const getActiveAnnouncements = cache(async (context: AnnouncementContext = {}) => {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      status: AnnouncementStatus.ACTIVE,
      AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      ...(Object.keys(context).length > 0
        ? { OR: [{ targets: { none: {} } }, { targets: { some: { OR: buildTargetFilters(context) } } }] }
        : { targets: { none: {} } }),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, imageUrl: true, destination: true, startsAt: true, endsAt: true },
  });
});

function buildTargetFilters(context: AnnouncementContext) {
  return [
    context.associationId && { type: AnnouncementTargetType.ASSOCIATION, value: context.associationId },
    context.continentSlug && { type: AnnouncementTargetType.CONTINENT, value: context.continentSlug },
    context.countrySlug && { type: AnnouncementTargetType.COUNTRY, value: context.countrySlug },
    context.citySlug && { type: AnnouncementTargetType.CITY, value: context.citySlug },
  ].filter(Boolean) as Array<{ type: AnnouncementTargetType; value: string }>;
}