import "dotenv/config";
import { ArticleStatus, ContentModerationStatus, SourceLevel, type Prisma, type SourceRegistryType } from "../app/generated/prisma";
import { prisma } from "../lib/prisma";
import { evaluateGabonRelevance } from "../lib/relevance/gabon-relevance-engine";

type GreDecision = { score: number; flags: { requires_human_review: boolean }; routing: { primary_target: string } };
const WRITE_BATCH_SIZE = 25;
const MIN_RELIABILITY = 3;
const MAX_ARTICLE_AGE_DAYS = 30;
const MAX_SOURCE_FETCH_AGE_DAYS = 14;

function sourceLevelFor(type: SourceRegistryType): SourceLevel {
  if (type === "GOVERNMENT" || type === "DIPLOMATIC") return SourceLevel.LEVEL_A;
  if (type === "UNIVERSITY") return SourceLevel.LEVEL_B;
  if (type === "MEDIA") return SourceLevel.LEVEL_C;
  return SourceLevel.LEVEL_D;
}

function isFresh(date: Date | null, maximumAgeDays: number, now: Date): boolean {
  return Boolean(date && date.getTime() >= now.getTime() - maximumAgeDays * 86400000);
}

function isGreDecision(value: Prisma.JsonValue | null): value is Prisma.JsonObject & GreDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const flags = value.flags;
  const routing = value.routing;
  return typeof value.score === "number" && Boolean(flags && typeof flags === "object" && !Array.isArray(flags) && typeof flags.requires_human_review === "boolean") && Boolean(routing && typeof routing === "object" && !Array.isArray(routing) && typeof routing.primary_target === "string");
}

async function main() {
  const [pending, sources] = await Promise.all([
    prisma.article.findMany({ where: { moderationStatus: ContentModerationStatus.PENDING }, select: { id: true, title: true, summary: true, content: true, sourceName: true, canonicalUrl: true, createdAt: true } }),
    prisma.sourceRegistry.findMany({ select: { name: true, type: true, reliability: true, active: true, lastFetchedAt: true } }),
  ]);
  const sourcesByName = new Map(sources.map((source) => [source.name, source]));
  const publishIds: string[] = [];
  const rejectIds: string[] = [];
  const archiveIds: string[] = [];
  const decisions: Array<{ id: string; relevanceDecision: Prisma.InputJsonValue; relevanceScore: number; relevanceLevel: string; sourceLevel: SourceLevel; reviewReason: string }> = [];
  const now = new Date();
  for (const article of pending) {
    const source = article.sourceName ? sourcesByName.get(article.sourceName) : undefined;
    if (!source || !article.sourceName) { archiveIds.push(article.id); continue; }
    const decision = evaluateGabonRelevance({ contentId: article.id, domain: "articles", title: article.title, excerpt: article.summary ?? "", content: article.content, sourceType: source.type, sourceName: article.sourceName, canonicalUrl: article.canonicalUrl });
    const sourceIsFresh = isFresh(source.lastFetchedAt, MAX_SOURCE_FETCH_AGE_DAYS, now);
    const articleIsFresh = isFresh(article.createdAt, MAX_ARTICLE_AGE_DAYS, now);
    const sourceIsReliable = source.active && source.reliability >= MIN_RELIABILITY;
    const base = { id: article.id, relevanceDecision: JSON.parse(JSON.stringify(decision)) as Prisma.InputJsonValue, relevanceScore: decision.score, relevanceLevel: decision.level, sourceLevel: sourceLevelFor(source.type) };
    if (!articleIsFresh || !sourceIsFresh || !sourceIsReliable) {
      archiveIds.push(article.id);
      decisions.push({ ...base, reviewReason: !articleIsFresh ? "Archive automatiquement : contenu caduc (plus de 30 jours)." : !sourceIsFresh ? "Archive automatiquement : source non rafraichie depuis plus de 14 jours." : "Archive automatiquement : source inactive ou fiabilite inferieure au seuil." });
    } else if (decision.routing.primary_target === "QUARANTINE" || decision.score < 70) {
      rejectIds.push(article.id);
      decisions.push({ ...base, reviewReason: decision.routing.primary_target === "QUARANTINE" ? "Rejete automatiquement : hors perimetre Gabon/Diaspora selon GRE." : `Rejete automatiquement : score GRE ${decision.score}/100 inferieur au seuil de publication 70/100.` });
    } else {
      publishIds.push(article.id);
      decisions.push({ ...base, reviewReason: decision.flags.requires_human_review ? `Approuve apres traitement de moderation : score GRE ${decision.score}/100, signal sensible trace.` : `Approuve automatiquement : score GRE ${decision.score}/100 et source fiable.` });
    }
  }
  for (let index = 0; index < decisions.length; index += WRITE_BATCH_SIZE) {
    const batch = decisions.slice(index, index + WRITE_BATCH_SIZE);
    await prisma.$transaction(batch.map((article) => prisma.article.update({ where: { id: article.id }, data: { relevanceDecision: article.relevanceDecision, relevanceScore: article.relevanceScore, relevanceLevel: article.relevanceLevel, sourceLevel: article.sourceLevel, reviewReason: article.reviewReason, reviewedAt: now } })));
  }
  await prisma.$transaction([
    prisma.article.updateMany({ where: { id: { in: publishIds } }, data: { status: ArticleStatus.PUBLISHED, moderationStatus: ContentModerationStatus.APPROVED, publishedAt: now, archivedAt: null } }),
    prisma.article.updateMany({ where: { id: { in: rejectIds } }, data: { status: ArticleStatus.DRAFT, moderationStatus: ContentModerationStatus.REJECTED, publishedAt: null } }),
    prisma.article.updateMany({ where: { id: { in: archiveIds } }, data: { status: ArticleStatus.ARCHIVED, moderationStatus: ContentModerationStatus.REJECTED, publishedAt: null, archivedAt: now } }),
  ]);
  console.log("[activate-pending-news]", { inspected: pending.length, approved: publishIds.length, rejected: rejectIds.length, archived: archiveIds.length });
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });