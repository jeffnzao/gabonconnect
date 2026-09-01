"use server";

import { ContentModerationStatus, EmbeddingSourceType } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { contentDomains, type ContentAction, type ContentDomain, type ContentItem } from "@/lib/content-types";
import { normalizeSlug } from "@/lib/phase13";
import { dispatchContentNotifications, type NotifiableContentType } from "@/lib/notifications";
import { indexContentForRAG } from "@/lib/ai/vector-store";

const NOTIFIABLE_DOMAINS: ContentDomain[] = ["articles", "events", "opportunities"];

// Domaines couverts par le pipeline RAG (Task 061) : associations/shops n'ont pas d'EmbeddingSourceType.
const DOMAIN_TO_EMBEDDING_SOURCE_TYPE: Partial<Record<ContentDomain, EmbeddingSourceType>> = {
  articles: EmbeddingSourceType.ARTICLE,
  events: EmbeddingSourceType.EVENT,
  opportunities: EmbeddingSourceType.OPPORTUNITY,
  scholarships: EmbeddingSourceType.SCHOLARSHIP,
  procedures: EmbeddingSourceType.ADMINISTRATIVE_PROCEDURE,
};

async function requireAdmin() {
  const user = await ensureUser();
  if (!user || !isAdminRole(user.role)) throw new Error("Admin access required.");
  return user;
}

function excerpt(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 180);
}

export async function listContentItems(filters: { domain?: ContentDomain; moderationStatus?: ContentModerationStatus; query?: string; page?: number } = {}) {
  await requireAdmin();
  const query = filters.query?.trim();
  const contains = query ? { contains: query, mode: "insensitive" as const } : undefined;
  const whereBase = filters.moderationStatus ? { moderationStatus: filters.moderationStatus } : {};
  const results: ContentItem[] = [];
  const selected = filters.domain ? [filters.domain] : contentDomains;

  if (selected.includes("articles")) {
    const rows = await prisma.article.findMany({ where: { ...whereBase, ...(query ? { OR: [{ title: contains }, { summary: contains }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, title: true, summary: true, status: true, moderationStatus: true, publishedAt: true, archivedAt: true, sourceName: true, canonicalUrl: true, copyrightFlag: true, createdAt: true } });
    results.push(...rows.map((row) => ({ id: row.id, domain: "articles" as const, title: row.title, excerpt: excerpt(row.summary), businessStatus: row.status, moderationStatus: row.moderationStatus, publishedAt: row.publishedAt, archivedAt: row.archivedAt, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, copyrightFlag: row.copyrightFlag, createdAt: row.createdAt })));
  }
  if (selected.includes("events")) {
    const rows = await prisma.event.findMany({ where: { ...whereBase, ...(query ? { OR: [{ title: contains }, { description: contains }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, title: true, description: true, status: true, moderationStatus: true, publishedAt: true, archivedAt: true, sourceName: true, canonicalUrl: true, copyrightFlag: true, createdAt: true } });
    results.push(...rows.map((row) => ({ id: row.id, domain: "events" as const, title: row.title, excerpt: excerpt(row.description), businessStatus: row.status, moderationStatus: row.moderationStatus, publishedAt: row.publishedAt, archivedAt: row.archivedAt, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, copyrightFlag: row.copyrightFlag, createdAt: row.createdAt })));
  }
  if (selected.includes("opportunities")) {
    const rows = await prisma.opportunity.findMany({ where: { ...whereBase, ...(query ? { OR: [{ title: contains }, { description: contains }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, title: true, description: true, status: true, moderationStatus: true, publishedAt: true, archivedAt: true, sourceName: true, canonicalUrl: true, copyrightFlag: true, createdAt: true } });
    results.push(...rows.map((row) => ({ id: row.id, domain: "opportunities" as const, title: row.title, excerpt: excerpt(row.description), businessStatus: row.status, moderationStatus: row.moderationStatus, publishedAt: row.publishedAt, archivedAt: row.archivedAt, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, copyrightFlag: row.copyrightFlag, createdAt: row.createdAt })));
  }
  if (selected.includes("shops")) {
    const rows = await prisma.shop.findMany({ where: { ...whereBase, ...(query ? { OR: [{ name: contains }, { description: contains }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, name: true, description: true, status: true, moderationStatus: true, publishedAt: true, archivedAt: true, sourceName: true, canonicalUrl: true, copyrightFlag: true, createdAt: true } });
    results.push(...rows.map((row) => ({ id: row.id, domain: "shops" as const, title: row.name, excerpt: excerpt(row.description), businessStatus: row.status, moderationStatus: row.moderationStatus, publishedAt: row.publishedAt, archivedAt: row.archivedAt, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, copyrightFlag: row.copyrightFlag, createdAt: row.createdAt })));
  }
  if (selected.includes("scholarships")) {
    const rows = await prisma.scholarship.findMany({ where: { ...whereBase, ...(query ? { OR: [{ title: contains }, { description: contains }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, title: true, description: true, moderationStatus: true, publishedAt: true, archivedAt: true, sourceName: true, canonicalUrl: true, copyrightFlag: true, createdAt: true } });
    results.push(...rows.map((row) => ({ id: row.id, domain: "scholarships" as const, title: row.title, excerpt: excerpt(row.description), businessStatus: "PUBLISHED", moderationStatus: row.moderationStatus, publishedAt: row.publishedAt, archivedAt: row.archivedAt, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, copyrightFlag: row.copyrightFlag, createdAt: row.createdAt })));
  }
  if (selected.includes("procedures")) {
    const rows = await prisma.administrativeProcedure.findMany({ where: { ...whereBase, ...(query ? { OR: [{ title: contains }, { description: contains }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, title: true, description: true, moderationStatus: true, publishedAt: true, archivedAt: true, sourceName: true, canonicalUrl: true, copyrightFlag: true, createdAt: true } });
    results.push(...rows.map((row) => ({ id: row.id, domain: "procedures" as const, title: row.title, excerpt: excerpt(row.description), businessStatus: "PUBLISHED", moderationStatus: row.moderationStatus, publishedAt: row.publishedAt, archivedAt: row.archivedAt, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, copyrightFlag: row.copyrightFlag, createdAt: row.createdAt })));
  }
  if (selected.includes("associations")) {
    const rows = await prisma.association.findMany({ where: { ...whereBase, ...(query ? { OR: [{ name: contains }, { description: contains }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, name: true, description: true, status: true, moderationStatus: true, publishedAt: true, archivedAt: true, sourceName: true, canonicalUrl: true, copyrightFlag: true, createdAt: true } });
    results.push(...rows.map((row) => ({ id: row.id, domain: "associations" as const, title: row.name, excerpt: excerpt(row.description), businessStatus: row.status, moderationStatus: row.moderationStatus, publishedAt: row.publishedAt, archivedAt: row.archivedAt, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, copyrightFlag: row.copyrightFlag, createdAt: row.createdAt })));
  }

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = 20;
  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { items: results.slice((page - 1) * pageSize, page * pageSize), total: results.length, pageSize };
}

type ContentDelegate = {
  update: (args: unknown) => Promise<unknown>;
  findUnique: (args: unknown) => Promise<unknown>;
};

function delegate(domain: ContentDomain): ContentDelegate {
  const delegates = { articles: prisma.article, events: prisma.event, opportunities: prisma.opportunity, shops: prisma.shop, scholarships: prisma.scholarship, procedures: prisma.administrativeProcedure, associations: prisma.association };
  return delegates[domain] as unknown as ContentDelegate;
}

export async function moderateContent(domain: ContentDomain, id: string, action: ContentAction): Promise<void> {
  await requireAdmin();
  const businessData = action === "publish"
    ? domain === "articles" ? { status: "PUBLISHED" } : domain === "events" ? { status: "PUBLISHED" } : domain === "opportunities" ? { status: "PUBLISHED" } : domain === "shops" ? { status: "PUBLISHED" } : domain === "associations" ? { status: "APPROVED" } : {}
    : action === "unpublish"
      ? domain === "articles" ? { status: "DRAFT" } : domain === "events" ? { status: "DRAFT" } : domain === "opportunities" ? { status: "CLOSED" } : domain === "shops" ? { status: "DRAFT" } : domain === "associations" ? { status: "PENDING" } : {}
      : action === "archive"
        ? domain === "articles" ? { status: "ARCHIVED" } : domain === "shops" ? { status: "ARCHIVED" } : domain === "opportunities" ? { status: "ARCHIVED" } : {}
        : {};
  const data = action === "approve" ? { moderationStatus: ContentModerationStatus.APPROVED } : action === "reject" ? { moderationStatus: ContentModerationStatus.REJECTED } : action === "publish" ? { ...businessData, moderationStatus: ContentModerationStatus.APPROVED, publishedAt: new Date(), archivedAt: null } : action === "unpublish" ? { ...businessData, publishedAt: null } : { ...businessData, archivedAt: new Date(), publishedAt: null };
  await delegate(domain).update({ where: { id }, data } as never);
  revalidatePath("/admin/content");

  // Reindexation RAG (Task 061), en tache de fond : ne bloque jamais la reponse de moderation.
  const embeddingSourceType = DOMAIN_TO_EMBEDDING_SOURCE_TYPE[domain];
  if (embeddingSourceType) {
    void indexContentForRAG(embeddingSourceType, id).catch((error) => {
      console.error("[moderateContent] RAG indexing failed:", error);
    });
  }

  // Dispatch des notifications ciblees (Task 060) uniquement quand le contenu devient APPROVED + publie.
  if (action === "publish" && NOTIFIABLE_DOMAINS.includes(domain)) {
    try {
      await dispatchContentNotifications(id, domain as NotifiableContentType);
    } catch (error) {
      console.error("[moderateContent] notification dispatch failed:", error);
    }
  }
}

export async function getContentItem(domain: ContentDomain, id: string) {
  await requireAdmin();
  const row = await delegate(domain).findUnique({ where: { id } } as never) as Record<string, unknown> | null;
  if (!row) return null;
  return {
    id,
    domain,
    title: String(row.title ?? row.name ?? ""),
    excerpt: excerpt(typeof row.description === "string" ? row.description : null),
    businessStatus: String(row.status ?? "PUBLISHED"),
    moderationStatus: row.moderationStatus as ContentModerationStatus,
    publishedAt: (row.publishedAt as Date | null | undefined) ?? null,
    archivedAt: (row.archivedAt as Date | null | undefined) ?? null,
    sourceName: (row.sourceName as string | null | undefined) ?? null,
    canonicalUrl: (row.canonicalUrl as string | null | undefined) ?? null,
    copyrightFlag: Boolean(row.copyrightFlag),
    createdAt: row.createdAt as Date,
  } satisfies ContentItem;
}

export async function batchModerateContent(items: { domain: ContentDomain; id: string }[], action: ContentAction): Promise<void> {
  await requireAdmin();
  for (const item of items) await moderateContent(item.domain, item.id, action);
}

export async function updateContentMetadata(domain: ContentDomain, id: string, input: { title: string; description: string; canonicalUrl?: string; sourceName?: string; copyrightFlag: boolean }): Promise<void> {
  await requireAdmin();
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description) throw new Error("Title and description are required.");
  const data = { canonicalUrl: input.canonicalUrl?.trim() || null, sourceName: input.sourceName?.trim() || null, copyrightFlag: input.copyrightFlag };
  const titleData = domain === "shops" ? { name: title } : domain === "associations" ? { name: title } : { title };
  await delegate(domain).update({ where: { id }, data: { ...titleData, description, ...data } } as never);
  revalidatePath("/admin/content");
}

export async function updateContentMetadataFromForm(domain: ContentDomain, id: string, formData: FormData): Promise<void> {
  await updateContentMetadata(domain, id, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    canonicalUrl: String(formData.get("canonicalUrl") ?? ""),
    sourceName: String(formData.get("sourceName") ?? ""),
    copyrightFlag: formData.get("copyrightFlag") === "on",
  });
}

export async function createContentDraft(domain: ContentDomain, input: { title: string; description: string; canonicalUrl?: string; sourceName?: string; copyrightFlag: boolean }): Promise<void> {
  const user = await requireAdmin();
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description) throw new Error("Title and description are required.");
  const slug = `${normalizeSlug(title) || "content"}-${Date.now()}`;
  const metadata = { canonicalUrl: input.canonicalUrl?.trim() || undefined, sourceName: input.sourceName?.trim() || undefined, copyrightFlag: input.copyrightFlag, moderationStatus: ContentModerationStatus.PENDING };
  if (domain === "articles") await prisma.article.create({ data: { authorId: user.id, title, slug, summary: description.slice(0, 500), content: description, status: "DRAFT", ...metadata } });
  if (domain === "events") await prisma.event.create({ data: { title, slug, description, startDate: new Date(Date.now() + 86400000), location: "A definir", organizerType: "USER", createdById: user.id, status: "DRAFT", ...metadata } });
  if (domain === "opportunities") await prisma.opportunity.create({ data: { title, slug, description, type: "JOB", location: "A definir", createdById: user.id, status: "DRAFT", ...metadata } });
  if (domain === "shops") await prisma.shop.create({ data: { ownerId: user.id, name: title, slug, description, status: "DRAFT", ...metadata } });
  if (domain === "scholarships") await prisma.scholarship.create({ data: { title, provider: input.sourceName?.trim() || "A definir", country: "A definir", level: "MASTER", description, eligibilityCriteria: "A completer", deadline: new Date(Date.now() + 86400000 * 30), applicationUrl: input.canonicalUrl?.trim() || "https://example.com", ...metadata } });
  if (domain === "procedures") await prisma.administrativeProcedure.create({ data: { slug, title, description, category: "INTEGRATION", estimatedDays: 1, cost: "A definir", officialUrl: input.canonicalUrl?.trim() || "https://example.com", ...metadata } });
  if (domain === "associations") await prisma.association.create({ data: { name: title, slug, description, status: "PENDING", ...metadata } });
  revalidatePath("/admin/content");
}

export async function createContentDraftFromForm(formData: FormData): Promise<void> {
  const rawDomain = String(formData.get("domain") ?? "");
  if (!contentDomains.includes(rawDomain as ContentDomain)) throw new Error("Invalid content domain.");
  const domain = rawDomain as ContentDomain;
  await createContentDraft(domain, { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), canonicalUrl: String(formData.get("canonicalUrl") ?? ""), sourceName: String(formData.get("sourceName") ?? ""), copyrightFlag: formData.get("copyrightFlag") === "on" });
}
