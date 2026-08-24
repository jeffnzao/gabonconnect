"use server";

import {
  AnnouncementStatus,
  AnnouncementTargetType,
  AssociationStatus,
  ArticleStatus,
  ConsentType,
  ProductStatus,
  ShopStatus,
} from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canManageResource,
  normalizeSlug,
  validateAnnouncementTargets,
  type AnnouncementTargetDraft,
} from "@/lib/phase13";

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

async function canManage(ownerId: string) {
  const user = await requireUser();
  if (!canManageResource(ownerId, user.id, user.role)) throw new Error("Not authorized.");
  return user;
}

export async function createArticleDraft(input: {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  imageUrl?: string;
}) {
  const user = await requireUser();
  const title = input.title.trim();
  const slug = normalizeSlug(input.slug || input.title);
  const content = input.content.trim();
  if (!title || !slug || !content) throw new Error("Article title, slug, and content are required.");

  return prisma.article.create({
    data: {
      authorId: user.id,
      title,
      slug,
      summary: input.summary?.trim() || undefined,
      content,
      imageUrl: input.imageUrl?.trim() || undefined,
    },
  });
}

export async function publishArticle(articleId: string) {
  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { authorId: true } });
  if (!article) throw new Error("Article not found.");
  await canManage(article.authorId);

  return prisma.article.update({
    where: { id: articleId },
    data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date() },
  });
}

export async function createAnnouncementDraft(input: {
  title: string;
  description: string;
  imageUrl?: string;
  destination?: string;
  startsAt?: Date;
  endsAt?: Date;
  targets?: AnnouncementTargetDraft[];
}) {
  const user = await requireUser();
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description) throw new Error("Announcement title and description are required.");
  const targets = validateAnnouncementTargets(input.targets ?? []);

  return prisma.announcement.create({
    data: {
      ownerId: user.id,
      title,
      description,
      imageUrl: input.imageUrl?.trim() || undefined,
      destination: input.destination?.trim() || undefined,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      targets: {
        create: targets.map((target) => ({ type: AnnouncementTargetType[target.type], value: target.value })),
      },
    },
  });
}

export async function setAnnouncementStatus(announcementId: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED") {
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId }, select: { ownerId: true } });
  if (!announcement) throw new Error("Announcement not found.");
  await canManage(announcement.ownerId);
  return prisma.announcement.update({ where: { id: announcementId }, data: { status: AnnouncementStatus[status] } });
}

export async function createShopDraft(input: { name: string; slug: string; description?: string; associationId?: string }) {
  const user = await requireUser();
  const name = input.name.trim();
  const slug = normalizeSlug(input.slug || input.name);
  if (!name || !slug) throw new Error("Shop name and slug are required.");

  if (input.associationId) {
    const association = await prisma.association.findUnique({
      where: { id: input.associationId },
      select: { status: true },
    });
    if (!association || association.status !== AssociationStatus.APPROVED) {
      throw new Error("Shop association must be approved.");
    }
  }

  return prisma.shop.create({
    data: { ownerId: user.id, name, slug, description: input.description?.trim() || undefined, associationId: input.associationId },
  });
}

export async function publishShop(shopId: string) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { ownerId: true } });
  if (!shop) throw new Error("Shop not found.");
  await canManage(shop.ownerId);
  return prisma.shop.update({ where: { id: shopId }, data: { status: ShopStatus.PUBLISHED } });
}

export async function createProductDraft(input: { shopId: string; name: string; description?: string; imageUrl?: string; price?: string }) {
  const shop = await prisma.shop.findUnique({ where: { id: input.shopId }, select: { ownerId: true } });
  if (!shop) throw new Error("Shop not found.");
  await canManage(shop.ownerId);
  const name = input.name.trim();
  const price = input.price?.trim();
  if (!name) throw new Error("Product name is required.");
  if (price && (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) < 0)) {
    throw new Error("Product price must be a non-negative amount.");
  }
  return prisma.product.create({
    data: {
      shopId: input.shopId,
      name,
      description: input.description?.trim() || undefined,
      imageUrl: input.imageUrl?.trim() || undefined,
      price: price || undefined,
    },
  });
}

export async function publishProduct(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { shop: { select: { ownerId: true } } } });
  if (!product) throw new Error("Product not found.");
  await canManage(product.shop.ownerId);
  return prisma.product.update({ where: { id: productId }, data: { status: ProductStatus.PUBLISHED } });
}

export async function saveConsent(type: "ADVERTISING" | "COMMUNICATIONS", granted: boolean) {
  const user = await requireUser();
  const now = new Date();
  return prisma.userConsent.upsert({
    where: { userId_type: { userId: user.id, type: ConsentType[type] } },
    create: { userId: user.id, type: ConsentType[type], granted, grantedAt: granted ? now : null, revokedAt: granted ? null : now },
    update: { granted, grantedAt: granted ? now : null, revokedAt: granted ? null : now },
  });
}