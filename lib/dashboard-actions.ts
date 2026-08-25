"use server";

import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/auth";
import { verifyResourceOwnership, verifyAssociationMembership } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { EventStatus, OpportunityStatus, UserStatus } from "@/app/generated/prisma";

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function updateUserPresenceStatus(status: UserStatus) {
  const user = await requireUser();
  if (!Object.values(UserStatus).includes(status)) throw new Error("Invalid presence status.");
  return prisma.profile.update({
    where: { userId: user.id },
    data: { status, showStatus: true },
    select: { status: true, showStatus: true },
  });
}

export async function deleteUserEvent(eventId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(eventId, user.id, "event");
  if (!isOwner) throw new Error("You do not have permission to delete this event.");
  const result = await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/events");
  revalidatePath("/events/[slug]");
  revalidatePath("/dashboard");
  return result;
}

export async function cancelUserEvent(eventId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(eventId, user.id, "event");
  if (!isOwner) throw new Error("You do not have permission to cancel this event.");
  const result = await prisma.event.update({
    where: { id: eventId },
    data: { status: EventStatus.CANCELLED },
    select: { id: true, status: true },
  });

  revalidatePath("/events");
  revalidatePath("/events/[slug]");
  revalidatePath("/dashboard");

  return result;
}

export async function deleteUserOpportunity(opportunityId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(opportunityId, user.id, "opportunity");
  if (!isOwner) throw new Error("You do not have permission to delete this opportunity.");
  return prisma.opportunity.delete({ where: { id: opportunityId } });
}

export async function closeUserOpportunity(opportunityId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(opportunityId, user.id, "opportunity");
  if (!isOwner) throw new Error("You do not have permission to close this opportunity.");
  return prisma.opportunity.update({
    where: { id: opportunityId },
    data: { status: OpportunityStatus.CLOSED },
    select: { id: true, status: true },
  });
}

export async function deleteUserPost(postId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(postId, user.id, "post");
  if (!isOwner) throw new Error("You do not have permission to delete this post.");
  return prisma.post.delete({ where: { id: postId } });
}

export async function manageAssociationMember(
  associationId: string,
  memberId: string,
  action: "approve" | "reject" | "remove"
) {
  const user = await requireUser();
  const isAssociationMember = await verifyAssociationMembership(associationId, user.id);
  if (!isAssociationMember) throw new Error("You do not have permission to manage this association.");

  const association = await prisma.association.findUnique({
    where: { id: associationId },
    select: { id: true },
  });
  if (!association) throw new Error("Association not found.");

  const memberRecord = await prisma.associationMember.findUnique({
    where: { associationId_profileId: { associationId, profileId: memberId } },
    select: { id: true },
  });

  if (!memberRecord) throw new Error("Member record not found.");

  if (action === "remove") {
    return prisma.associationMember.delete({
      where: { associationId_profileId: { associationId, profileId: memberId } },
    });
  }

  throw new Error("Invalid action.");
}

export async function hideUserPresence() {
  const user = await requireUser();
  return prisma.profile.update({
    where: { userId: user.id },
    data: { showStatus: false },
    select: { status: true, showStatus: true },
  });
}

export async function showUserPresence() {
  const user = await requireUser();
  return prisma.profile.update({
    where: { userId: user.id },
    data: { showStatus: true },
    select: { status: true, showStatus: true },
  });
}
