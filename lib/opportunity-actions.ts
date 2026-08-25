"use server";

import { AssociationStatus, OpportunityStatus, OpportunityType, Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/phase13";
import { canApplyToOpportunity, canCreateAssociationOpportunity } from "@/lib/opportunities";
import { z } from "zod";

const opportunitySchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1),
  type: z.enum(["JOB", "INTERNSHIP", "VOLUNTEERING", "PROJECT_CALL", "MUTUAL_AID"]),
  location: z.string().trim().min(1).max(200),
  isRemote: z.boolean().default(false),
  companyName: z.string().trim().max(180).optional(),
  applicationUrl: z.string().trim().url().optional(),
  contactEmail: z.string().trim().email().optional(),
  associationId: z.string().trim().optional(),
});

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function createOpportunity(input: unknown) {
  const user = await requireUser();
  const data = opportunitySchema.parse(input);
  const slug = normalizeSlug(data.slug || data.title);
  if (!slug) throw new Error("Opportunity slug is required.");

  if (data.associationId) {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!profile) throw new Error("Complete your profile before creating an association opportunity.");
    const association = await prisma.association.findUnique({ where: { id: data.associationId }, select: { status: true } });
    if (!association) throw new Error("Association not found.");
    const membership = await prisma.associationMember.findUnique({ where: { associationId_profileId: { associationId: data.associationId, profileId: profile.id } }, select: { id: true } });
    if (!canCreateAssociationOpportunity(association.status, Boolean(membership))) {
      throw new Error(association.status !== AssociationStatus.APPROVED ? "Only approved associations can publish opportunities." : "You must be an association member to publish this opportunity.");
    }
  }

  return prisma.opportunity.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      type: OpportunityType[data.type],
      location: data.location,
      isRemote: data.isRemote,
      companyName: data.companyName || undefined,
      applicationUrl: data.applicationUrl || undefined,
      contactEmail: data.contactEmail || undefined,
      associationId: data.associationId || undefined,
      createdById: user.id,
      status: OpportunityStatus.PUBLISHED,
    },
  });
}

export async function applyToOpportunity(opportunityId: string, message?: string) {
  const user = await requireUser();
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { status: true } });
  if (!opportunity || !canApplyToOpportunity(opportunity.status)) throw new Error("Opportunity is not available for applications.");

  try {
    return await prisma.opportunityApplication.create({
      data: { opportunityId, applicantId: user.id, message: message?.trim() || undefined },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("You have already applied to this opportunity.");
    }
    throw error;
  }
}

export async function applyToOpportunityFromForm(opportunityId: string, formData: FormData) {
  await applyToOpportunity(opportunityId, String(formData.get("message") ?? ""));
}

export async function hasAppliedToOpportunity(opportunityId: string): Promise<boolean> {
  const user = await requireUser();
  const application = await prisma.opportunityApplication.findUnique({
    where: { opportunityId_applicantId: { opportunityId, applicantId: user.id } },
    select: { id: true },
  });
  return Boolean(application);
}