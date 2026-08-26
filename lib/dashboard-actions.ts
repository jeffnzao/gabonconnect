"use server";

import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/auth";
import { verifyResourceOwnership, verifyAssociationMembership } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, EventStatus, OpportunityStatus, ShopStatus, UserStatus } from "@/app/generated/prisma";
import { z } from "zod";

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

const articleUpdateSchema = z.object({ title: z.string().trim().min(1).max(180), slug: z.string().trim().min(1).max(180), summary: z.string().trim().max(500).optional(), content: z.string().trim().min(1).max(20000) });
const shopUpdateSchema = z.object({ name: z.string().trim().min(1).max(180), slug: z.string().trim().min(1).max(180), description: z.string().trim().max(2000).optional() });
const eventUpdateSchema = z.object({ title: z.string().trim().min(1).max(180), slug: z.string().trim().min(1).max(180), description: z.string().trim().min(1).max(20000), startDate: z.coerce.date(), endDate: z.coerce.date().optional(), location: z.string().trim().min(1).max(200) });
const opportunityUpdateSchema = z.object({ title: z.string().trim().min(1).max(180), slug: z.string().trim().min(1).max(180), description: z.string().trim().min(1).max(20000), location: z.string().trim().min(1).max(200) });

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

export async function deleteUserArticle(articleId: string) {
  const user = await requireUser();
  const isOwner = await prisma.article.findUnique({ where: { id: articleId }, select: { authorId: true } });
  if (!isOwner || isOwner.authorId !== user.id) throw new Error("You do not have permission to delete this article.");
  const result = await prisma.article.delete({ where: { id: articleId } });
  revalidatePath("/news");
  revalidatePath("/news/[slug]");
  revalidatePath("/dashboard");
  return result;
}

export async function setUserArticleStatus(articleId: string, status: ArticleStatus) {
  const user = await requireUser();
  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { authorId: true } });
  if (!article || article.authorId !== user.id) throw new Error("You do not have permission to update this article.");
  const result = await prisma.article.update({
    where: { id: articleId },
    data: { status, publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null },
    select: { id: true, status: true, publishedAt: true },
  });
  revalidatePath("/news");
  revalidatePath("/news/[slug]");
  revalidatePath("/dashboard");
  return result;
}

export async function updateUserArticle(articleId: string, input: unknown) {
  const user = await requireUser();
  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { authorId: true } });
  if (!article || article.authorId !== user.id) throw new Error("You do not have permission to update this article.");
  const data = articleUpdateSchema.parse(input);
  const result = await prisma.article.update({ where: { id: articleId }, data, select: { id: true, slug: true } });
  revalidatePath("/news"); revalidatePath("/news/[slug]"); revalidatePath("/dashboard");
  return result;
}

export async function deleteUserShop(shopId: string) {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { ownerId: true } });
  if (!shop || shop.ownerId !== user.id) throw new Error("You do not have permission to delete this shop.");
  const result = await prisma.shop.delete({ where: { id: shopId } });
  revalidatePath("/shops");
  revalidatePath("/shops/[slug]");
  revalidatePath("/dashboard");
  return result;
}

export async function setUserShopStatus(shopId: string, status: ShopStatus) {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { ownerId: true } });
  if (!shop || shop.ownerId !== user.id) throw new Error("You do not have permission to update this shop.");
  const result = await prisma.shop.update({ where: { id: shopId }, data: { status }, select: { id: true, status: true } });
  revalidatePath("/shops");
  revalidatePath("/shops/[slug]");
  revalidatePath("/dashboard");
  return result;
}

export async function updateUserShop(shopId: string, input: unknown) {
  const user = await requireUser();
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { ownerId: true } });
  if (!shop || shop.ownerId !== user.id) throw new Error("You do not have permission to update this shop.");
  const data = shopUpdateSchema.parse(input);
  const result = await prisma.shop.update({ where: { id: shopId }, data, select: { id: true, slug: true } });
  revalidatePath("/shops"); revalidatePath("/shops/[slug]"); revalidatePath("/dashboard");
  return result;
}

export async function updateUserEvent(eventId: string, input: unknown) {
  const user = await requireUser();
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { createdById: true } });
  if (!event || event.createdById !== user.id) throw new Error("You do not have permission to update this event.");
  const data = eventUpdateSchema.parse(input);
  if (data.endDate && data.endDate <= data.startDate) throw new Error("Event end date must be after its start date.");
  const result = await prisma.event.update({ where: { id: eventId }, data, select: { id: true, slug: true } });
  revalidatePath("/events"); revalidatePath("/events/[slug]"); revalidatePath("/dashboard");
  return result;
}

export async function updateUserOpportunity(opportunityId: string, input: unknown) {
  const user = await requireUser();
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { createdById: true } });
  if (!opportunity || opportunity.createdById !== user.id) throw new Error("You do not have permission to update this opportunity.");
  const data = opportunityUpdateSchema.parse(input);
  const result = await prisma.opportunity.update({ where: { id: opportunityId }, data, select: { id: true, slug: true } });
  revalidatePath("/opportunities"); revalidatePath("/opportunities/[slug]"); revalidatePath("/dashboard");
  return result;
}

export async function deleteUserOpportunity(opportunityId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(opportunityId, user.id, "opportunity");
  if (!isOwner) throw new Error("You do not have permission to delete this opportunity.");
  const result = await prisma.opportunity.delete({ where: { id: opportunityId } });
  revalidatePath("/opportunities");
  revalidatePath("/opportunities/[slug]");
  revalidatePath("/dashboard");
  return result;
}

export async function closeUserOpportunity(opportunityId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(opportunityId, user.id, "opportunity");
  if (!isOwner) throw new Error("You do not have permission to close this opportunity.");
  const result = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { status: OpportunityStatus.CLOSED },
    select: { id: true, status: true },
  });
  revalidatePath("/opportunities");
  revalidatePath("/opportunities/[slug]");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteUserPost(postId: string) {
  const user = await requireUser();
  const isOwner = await verifyResourceOwnership(postId, user.id, "post");
  if (!isOwner) throw new Error("You do not have permission to delete this post.");
  const result = await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return result;
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
