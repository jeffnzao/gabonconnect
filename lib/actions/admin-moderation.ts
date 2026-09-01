"use server";

import { ArticleStatus, ContentModerationStatus, type Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";
import { runNewsIngestion, type NewsIngestionResult } from "@/lib/ingestion/news-ingestion";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const articleIdSchema = z.string().uuid();
const articleActionSchema = z.enum(["approve", "reject", "request-changes"]);
export type ArticleModerationAction = z.infer<typeof articleActionSchema>;

type GreDecision = { score: number; level: string; flags: { requires_human_review: boolean }; routing: { primary_target: string } };

function isGreDecision(value: Prisma.JsonValue | null): value is Prisma.JsonObject & GreDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const flags = value.flags;
  const routing = value.routing;
  return typeof value.score === "number" && typeof value.level === "string"
    && Boolean(flags && typeof flags === "object" && !Array.isArray(flags) && typeof flags.requires_human_review === "boolean")
    && Boolean(routing && typeof routing === "object" && !Array.isArray(routing) && typeof routing.primary_target === "string");
}

async function requireAdmin() {
  const user = await ensureUser();
  if (!user || !isAdminRole(user.role)) throw new Error("Admin access required.");
  return user;
}

export async function getEditorialModerationDashboard(filters: { moderationStatus?: ContentModerationStatus; query?: string } = {}) {
  await requireAdmin();
  const query = filters.query?.trim();
  const rows = await prisma.article.findMany({
    where: { ...(filters.moderationStatus ? { moderationStatus: filters.moderationStatus } : {}), ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }] } : {}) },
    orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, title: true, summary: true, sourceName: true, canonicalUrl: true, moderationStatus: true, relevanceDecision: true },
  });
  return rows.map((row) => {
    const decision = isGreDecision(row.relevanceDecision) ? row.relevanceDecision : null;
    return { ...row, gre: decision ? { score: decision.score, level: decision.level, reviewReason: decision.flags.requires_human_review ? "Signal sensible ou score necessitant une validation editoriale." : decision.routing.primary_target === "HUMAN_REVIEW" ? "Le routage GRE requiert une validation editoriale." : null } : null };
  });
}

export async function moderateArticle(id: string, action: ArticleModerationAction): Promise<void> {
  await requireAdmin();
  const articleId = articleIdSchema.parse(id);
  const decision = articleActionSchema.parse(action);
  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } });
  if (!article) throw new Error("Article not found.");
  const data = decision === "approve"
    ? { status: ArticleStatus.PUBLISHED, moderationStatus: ContentModerationStatus.APPROVED, publishedAt: new Date(), archivedAt: null }
    : decision === "reject"
      ? { status: ArticleStatus.DRAFT, moderationStatus: ContentModerationStatus.REJECTED, publishedAt: null }
      : { status: ArticleStatus.DRAFT, moderationStatus: ContentModerationStatus.PENDING, publishedAt: null };
  await prisma.article.update({ where: { id: article.id }, data });
  revalidatePath("/admin/content");
  revalidatePath("/admin/sources");
}

export async function getIngestionMetrics() {
  await requireAdmin();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [processed, autoPublished, humanReview] = await prisma.$transaction([
    prisma.article.count({ where: { createdAt: { gte: since } } }),
    prisma.article.count({ where: { createdAt: { gte: since }, relevanceDecision: { path: ["routing", "primary_target"], equals: "AUTO_PUBLISH" } } }),
    prisma.article.count({ where: { createdAt: { gte: since }, relevanceDecision: { path: ["routing", "primary_target"], equals: "HUMAN_REVIEW" } } }),
  ]);
  return { processed, autoPublished, humanReview };
}

export async function triggerNewsIngestion(): Promise<NewsIngestionResult> {
  await requireAdmin();
  const result = await runNewsIngestion();
  revalidatePath("/admin/content");
  revalidatePath("/admin/sources");
  return result;
}