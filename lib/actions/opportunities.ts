"use server";

import { OpportunityApplicationStatus, OpportunityStatus } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function applyToOpportunity(opportunityId: string, data: { coverLetter?: string; cvUrl?: string }) {
  const user = await requireUser();
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { status: true } });
  if (!opportunity || opportunity.status !== OpportunityStatus.PUBLISHED) throw new Error("Opportunity is not available for applications.");
  const coverLetter = data.coverLetter?.trim() || undefined;
  const cvUrl = data.cvUrl?.trim() || undefined;
  if (cvUrl && !/^https?:\/\//i.test(cvUrl)) throw new Error("CV URL is invalid.");

  try {
    return await prisma.opportunityApplication.create({ data: { opportunityId, applicantId: user.id, coverLetter, cvUrl, message: coverLetter } });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") throw new Error("You have already applied to this opportunity.");
    throw error;
  }
}

export async function applyToOpportunityFromForm(opportunityId: string, formData: FormData) {
  return applyToOpportunity(opportunityId, {
    coverLetter: String(formData.get("coverLetter") ?? ""),
    cvUrl: String(formData.get("cvUrl") ?? ""),
  });
}

export async function getOpportunityApplications(opportunityId: string) {
  const user = await requireUser();
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { createdById: true } });
  if (!opportunity || (opportunity.createdById !== user.id && !isAdminRole(user.role))) throw new Error("Not authorized.");
  return prisma.opportunityApplication.findMany({ where: { opportunityId }, orderBy: { createdAt: "desc" }, select: { id: true, coverLetter: true, cvUrl: true, message: true, status: true, createdAt: true, applicant: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, profession: true } } } } } });
}

export async function updateOpportunityApplicationStatus(applicationId: string, status: OpportunityApplicationStatus) {
  const user = await requireUser();
  if (!Object.values(OpportunityApplicationStatus).includes(status)) throw new Error("Invalid application status.");
  const application = await prisma.opportunityApplication.findUnique({ where: { id: applicationId }, select: { opportunity: { select: { createdById: true } } } });
  if (!application || (application.opportunity.createdById !== user.id && !isAdminRole(user.role))) throw new Error("Not authorized.");
  return prisma.opportunityApplication.update({ where: { id: applicationId }, data: { status }, select: { id: true, status: true } });
}

export async function toggleSaveOpportunity(opportunityId: string) {
  const user = await requireUser();
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { id: true, status: true } });
  if (!opportunity || opportunity.status !== OpportunityStatus.PUBLISHED) throw new Error("Opportunity is not available.");
  const existing = await prisma.savedOpportunity.findUnique({ where: { opportunityId_userId: { opportunityId, userId: user.id } }, select: { id: true } });
  if (existing) {
    await prisma.savedOpportunity.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.savedOpportunity.create({ data: { opportunityId, userId: user.id } });
  return true;
}

export async function getSavedOpportunities() {
  const user = await requireUser();
  return prisma.savedOpportunity.findMany({ where: { userId: user.id, opportunity: { status: OpportunityStatus.PUBLISHED } }, orderBy: { createdAt: "desc" }, select: { createdAt: true, opportunity: { select: { id: true, slug: true, title: true, type: true, location: true, isRemote: true, companyName: true, createdAt: true } } } });
}

export async function getUserOpportunityApplications() {
  const user = await requireUser();
  return prisma.opportunityApplication.findMany({ where: { applicantId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true, status: true, coverLetter: true, createdAt: true, opportunity: { select: { slug: true, title: true, location: true } } } });
}

export async function getReceivedOpportunityApplications() {
  const user = await requireUser();
  return prisma.opportunityApplication.findMany({ where: { opportunity: { createdById: user.id } }, orderBy: { createdAt: "desc" }, select: { id: true, status: true, coverLetter: true, cvUrl: true, createdAt: true, opportunity: { select: { title: true, slug: true } }, applicant: { select: { email: true, profile: { select: { firstName: true, lastName: true, profession: true } } } } } });
}

export async function hasSavedOpportunity(opportunityId: string) {
  const user = await ensureUser();
  if (!user) return false;
  const saved = await prisma.savedOpportunity.findUnique({ where: { opportunityId_userId: { opportunityId, userId: user.id } }, select: { id: true } });
  return Boolean(saved);
}
