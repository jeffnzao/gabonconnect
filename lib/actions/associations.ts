"use server";

import { AssociationCategory, AssociationMemberRole, AssociationMemberStatus, AssociationStatus, type Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function getAssociations(filters: { country?: string; city?: string; category?: string } = {}) {
  const where: Prisma.AssociationWhereInput = { status: AssociationStatus.APPROVED };
  if (filters.country?.trim()) where.city = { country: { name: { contains: filters.country.trim(), mode: "insensitive" } } };
  if (filters.city?.trim()) where.city = { ...(where.city as object), name: { contains: filters.city.trim(), mode: "insensitive" } };
  if (filters.category && Object.values(AssociationCategory).includes(filters.category as AssociationCategory)) where.category = filters.category as AssociationCategory;
  return prisma.association.findMany({ where, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true, logo: true, logoUrl: true, description: true, category: true, website: true, email: true, phone: true, address: true, isVerified: true, city: { select: { name: true, country: { select: { name: true } } } }, _count: { select: { members: { where: { status: AssociationMemberStatus.APPROVED } } } } } });
}

export async function joinAssociation(associationId: string): Promise<void> {
  const user = await requireUser();
  const association = await prisma.association.findUnique({ where: { id: associationId }, select: { status: true } });
  if (!association || association.status !== AssociationStatus.APPROVED) throw new Error("Association is not available.");
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) throw new Error("Complete your profile before joining an association.");
  const existing = await prisma.associationMember.findFirst({ where: { associationId, userId: user.id }, select: { id: true, status: true } });
  if (!existing) await prisma.associationMember.create({ data: { associationId, profileId: profile.id, userId: user.id, role: "MEMBER", status: "PENDING" } });
}

export async function manageMemberStatus(associationId: string, memberId: string, status: AssociationMemberStatus): Promise<void> {
  const user = await requireUser();
  if (!Object.values(AssociationMemberStatus).includes(status)) throw new Error("Invalid membership status.");
  const member = await prisma.associationMember.findFirst({ where: { id: memberId, associationId }, select: { id: true } });
  if (!member) throw new Error("Membership request not found.");
  const manager = await prisma.associationMember.findFirst({ where: { associationId, userId: user.id, status: AssociationMemberStatus.APPROVED, role: { in: [AssociationMemberRole.ADMIN, AssociationMemberRole.TREASURER, AssociationMemberRole.SECRETARY] } }, select: { id: true } });
  if (!manager && !isAdminRole(user.role)) throw new Error("Not authorized.");
  await prisma.associationMember.update({ where: { id: memberId }, data: { status, joinedAt: status === AssociationMemberStatus.APPROVED ? new Date() : undefined } });
}
