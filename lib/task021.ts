"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  ArticleStatus,
  AssociationStatus,
  EventOrganizerType,
  EventStatus,
  OpportunityStatus,
  OpportunityType,
  ProductStatus,
  ShopStatus,
} from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/phase13";

export const newsSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180).optional(),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1).max(20000),
  imageUrl: z.string().trim().url().optional(),
});

export const shopSchema = z.object({
  name: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().max(2000).optional(),
  associationId: z.string().trim().optional(),
});

export const eventSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().min(1).max(20000),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().optional(),
  location: z.string().trim().min(1).max(200),
  isVirtual: z.boolean().default(false),
  virtualUrl: z.string().trim().url().optional(),
  organizerType: z.enum(["ASSOCIATION", "USER"]).default("USER"),
  associationId: z.string().trim().optional(),
  maxParticipants: z.coerce.number().int().positive().optional(),
});

export const opportunitySchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().min(1).max(20000),
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

async function ensureAssociationOwnershipOrMembershipForCreate(userId: string, associationId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) throw new Error("Complete your profile before creating content for an association.");

  const association = await prisma.association.findUnique({
    where: { id: associationId },
    select: { status: true },
  });

  if (!association || association.status !== AssociationStatus.APPROVED) {
    throw new Error("Only approved associations can receive creation requests.");
  }

  const membership = await prisma.associationMember.findUnique({
    where: { associationId_profileId: { associationId, profileId: profile.id } },
    select: { id: true },
  });

  if (!membership) throw new Error("You must be a member of the association to create content for it.");
}

export async function createNews(input: unknown) {
  const user = await requireUser();
  const data = newsSchema.parse(input);

  const slug = normalizeSlug(data.slug || data.title);
  if (!slug) throw new Error("News slug cannot be empty.");

  const article = await prisma.article.create({
    data: {
      authorId: user.id,
      title: data.title,
      slug,
      summary: data.summary?.trim() || undefined,
      content: data.content,
      imageUrl: data.imageUrl?.trim() || undefined,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  revalidatePath("/news");
  return article;
}

export async function createShop(input: unknown) {
  const user = await requireUser();
  const data = shopSchema.parse(input);

  const slug = normalizeSlug(data.slug || data.name);
  if (!slug) throw new Error("Shop slug cannot be empty.");

  if (data.associationId) {
    await ensureAssociationOwnershipOrMembershipForCreate(user.id, data.associationId);
  }

  const shop = await prisma.shop.create({
    data: {
      ownerId: user.id,
      name: data.name,
      slug,
      description: data.description?.trim() || undefined,
      associationId: data.associationId || undefined,
      status: ShopStatus.PUBLISHED,
    },
  });

  revalidatePath("/shops");
  return shop;
}

export async function createEvent(input: unknown) {
  const user = await requireUser();
  const data = eventSchema.parse(input);

  const startDate = new Date(data.startDate);
  if (Number.isNaN(startDate.getTime())) throw new Error("Event start date is invalid.");

  const endDate = data.endDate ? new Date(data.endDate) : undefined;
  if (endDate && Number.isNaN(endDate.getTime())) throw new Error("Event end date is invalid.");
  if (endDate && endDate <= startDate) throw new Error("Event end date must be after its start date.");

  if (data.isVirtual && !data.virtualUrl) throw new Error("Virtual events require a virtual URL.");
  if (!data.isVirtual && data.virtualUrl) throw new Error("Only virtual events can include a virtual URL.");

  const slug = normalizeSlug(data.slug || data.title);
  if (!slug) throw new Error("Event slug cannot be empty.");

  if (data.organizerType === "ASSOCIATION") {
    if (!data.associationId) throw new Error("Association organizer requires an association.");
    await ensureAssociationOwnershipOrMembershipForCreate(user.id, data.associationId);
  }

  const event = await prisma.event.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      startDate,
      endDate: endDate ?? undefined,
      location: data.location,
      isVirtual: data.isVirtual,
      virtualUrl: data.virtualUrl?.trim() || undefined,
      organizerType: EventOrganizerType[data.organizerType],
      associationId: data.associationId || undefined,
      createdById: user.id,
      maxParticipants: data.maxParticipants ?? undefined,
      status: EventStatus.PUBLISHED,
    },
  });

  revalidatePath("/events");
  return event;
}

export async function createOpportunity(input: unknown) {
  const user = await requireUser();
  const data = opportunitySchema.parse(input);

  const slug = normalizeSlug(data.slug || data.title);
  if (!slug) throw new Error("Opportunity slug cannot be empty.");

  if (data.associationId) {
    await ensureAssociationOwnershipOrMembershipForCreate(user.id, data.associationId);
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      type: OpportunityType[data.type],
      location: data.location,
      isRemote: data.isRemote,
      companyName: data.companyName?.trim() || undefined,
      applicationUrl: data.applicationUrl?.trim() || undefined,
      contactEmail: data.contactEmail?.trim() || undefined,
      associationId: data.associationId || undefined,
      createdById: user.id,
      status: OpportunityStatus.PUBLISHED,
    },
  });

  revalidatePath("/opportunities");
  return opportunity;
}

export async function createProduct(input: unknown) {
  const user = await requireUser();
  const parsed = z.object({
    shopId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(180),
    description: z.string().trim().max(2000).optional(),
    imageUrl: z.string().trim().url().optional(),
    price: z.string().trim().optional(),
  }).parse(input);

  const shop = await prisma.shop.findUnique({
    where: { id: parsed.shopId },
    select: { ownerId: true },
  });

  if (!shop) throw new Error("Shop not found.");
  if (shop.ownerId !== user.id) throw new Error("Not authorized to add products to this shop.");

  const priceValue = parsed.price?.trim();
  if (priceValue && (!/^\d+(\.\d{1,2})?$/.test(priceValue) || Number(priceValue) < 0)) {
    throw new Error("Price must be a non-negative numeric value with up to two decimals.");
  }

  const product = await prisma.product.create({
    data: {
      shopId: parsed.shopId,
      name: parsed.name,
      description: parsed.description?.trim() || undefined,
      imageUrl: parsed.imageUrl?.trim() || undefined,
      price: priceValue ? Number(priceValue) : undefined,
      status: ProductStatus.DRAFT,
    },
  });

  revalidatePath("/shops");
  return product;
}
