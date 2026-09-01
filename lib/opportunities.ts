import { cache } from "react";
import { OpportunityStatus, OpportunityType, Prisma } from "@/app/generated/prisma";
import { isMissingTableError, prisma } from "@/lib/prisma";

export interface OpportunityFilters {
  type?: OpportunityType;
  location?: string;
  associationId?: string;
}

export const PUBLIC_OPPORTUNITY_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  type: true,
  location: true,
  isRemote: true,
  companyName: true,
  applicationUrl: true,
  canonicalUrl: true,
  sourceName: true,
  contactEmail: true,
  association: { select: { id: true, name: true, slug: true } },
  createdAt: true,
  _count: { select: { applications: true } },
} satisfies Prisma.OpportunitySelect;

export function buildOpportunityWhere(filters: OpportunityFilters): Prisma.OpportunityWhereInput {
  const where: Prisma.OpportunityWhereInput = { status: OpportunityStatus.PUBLISHED, moderationStatus: "APPROVED", publishedAt: { not: null } };
  if (filters.type) where.type = filters.type;
  if (filters.location?.trim()) where.location = { contains: filters.location.trim(), mode: "insensitive" };
  if (filters.associationId) where.associationId = filters.associationId;
  return where;
}

export function isOpportunityPublic(status: OpportunityStatus): boolean {
  return status === OpportunityStatus.PUBLISHED;
}

export function canApplyToOpportunity(status: OpportunityStatus): boolean {
  return status === OpportunityStatus.PUBLISHED;
}

export function canCreateAssociationOpportunity(
  associationStatus: "APPROVED" | "PENDING" | "REJECTED" | null,
  hasMembership: boolean,
): boolean {
  return associationStatus === "APPROVED" && hasMembership;
}

export const getOpportunities = cache(async (filters: OpportunityFilters = {}) => {
  try {
    return await prisma.opportunity.findMany({
      where: buildOpportunityWhere(filters),
      orderBy: { createdAt: "desc" },
      select: PUBLIC_OPPORTUNITY_SELECT,
    });
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
});

export const getOpportunityBySlug = cache(async (slug: string) => {
  try {
    return await prisma.opportunity.findFirst({
      where: { slug, status: OpportunityStatus.PUBLISHED },
      select: PUBLIC_OPPORTUNITY_SELECT,
    });
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
});