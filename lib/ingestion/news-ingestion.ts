import { createHash } from "node:crypto";
import { ArticleStatus, ContentModerationStatus, type SourceRegistryType } from "@/app/generated/prisma";
import { normalizeFeedItems, type NormalizedFeedItem } from "@/lib/aggregation/normalizer";
import { fetchActiveSources } from "@/lib/aggregation/fetcher";
import { classifyArticle } from "@/lib/aggregation/classifier";
import { evaluateGabonRelevance } from "@/lib/gre";
import { prisma } from "@/lib/prisma";

const SYSTEM_INGESTION_USER_ID = "system-news-ingestion";
const SYSTEM_INGESTION_USER_EMAIL = "news-ingestion@gabonconnect.internal";

export interface IngestionSource {
  id: string;
  name: string;
  type: SourceRegistryType;
  url: string;
}

export interface NewsIngestionResult {
  sources: number;
  fetched: number;
  created: number;
  duplicates: number;
  failed: number;
  autoPublished: number;
  queuedForReview: number;
  quarantined: number;
}

export function normalizedContentHash(item: Pick<NormalizedFeedItem, "title" | "excerpt">): string {
  const normalized = `${item.title}\n${item.excerpt}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(normalized).digest("hex");
}

async function getSystemIngestionUser() {
  return prisma.user.upsert({
    where: { id: SYSTEM_INGESTION_USER_ID },
    create: { id: SYSTEM_INGESTION_USER_ID, email: SYSTEM_INGESTION_USER_EMAIL, role: "ADMIN" },
    update: {},
  });
}

async function isDuplicate(item: NormalizedFeedItem, contentHash: string): Promise<boolean> {
  return Boolean(await prisma.article.findFirst({
    where: { OR: [{ canonicalUrl: item.canonicalUrl }, { contentHash }] },
    select: { id: true },
  }));
}

function routingState(target: "AUTO_PUBLISH" | "HUMAN_REVIEW" | "QUARANTINE") {
  if (target === "AUTO_PUBLISH") return { status: ArticleStatus.PUBLISHED, moderationStatus: ContentModerationStatus.APPROVED, publishedAt: new Date() };
  if (target === "HUMAN_REVIEW") return { status: ArticleStatus.DRAFT, moderationStatus: ContentModerationStatus.PENDING, publishedAt: null };
  return { status: ArticleStatus.DRAFT, moderationStatus: ContentModerationStatus.REJECTED, publishedAt: null };
}

export async function ingestNormalizedNewsItem(item: NormalizedFeedItem, source: IngestionSource, authorId: string) {
  const contentHash = normalizedContentHash(item);
  if (await isDuplicate(item, contentHash)) return { outcome: "duplicate" as const };

  const decision = evaluateGabonRelevance({
    contentId: item.externalId,
    domain: "articles",
    title: item.title,
    excerpt: item.excerpt,
    content: item.excerpt,
    sourceType: source.type,
    sourceName: source.name,
    canonicalUrl: item.canonicalUrl,
  });
  const relevanceDecision = JSON.parse(JSON.stringify({ ...decision, content_hash: contentHash }));
  const state = routingState(decision.routing.primary_target);
  const slugBase = item.externalId.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().slice(0, 110) || "ingested-news";

  await prisma.article.create({
    data: {
      authorId,
      title: item.title,
      slug: `${slugBase}-${contentHash.slice(0, 10)}`,
      summary: item.excerpt,
      content: item.excerpt,
      imageUrl: item.imageUrl,
      category: classifyArticle(item.title, item.excerpt),
      canonicalUrl: item.canonicalUrl,
      contentHash,
      sourceName: source.name,
      copyrightFlag: true,
      relevanceDecision,
      ...state,
    },
  });
  return { outcome: decision.routing.primary_target as "AUTO_PUBLISH" | "HUMAN_REVIEW" | "QUARANTINE" };
}

/** Server-only pipeline: RSS/API collection, content-hash deduplication, GRE 2.0 routing, and persistence. */
export async function runNewsIngestion(): Promise<NewsIngestionResult> {
  const author = await getSystemIngestionUser();
  const sources = await fetchActiveSources();
  const result: NewsIngestionResult = { sources: sources.length, fetched: 0, created: 0, duplicates: 0, failed: 0, autoPublished: 0, queuedForReview: 0, quarantined: 0 };

  for (const fetchedSource of sources) {
    const startedAt = Date.now();
    if (fetchedSource.error) {
      result.failed += 1;
      await prisma.ingestionLog.create({ data: { sourceId: fetchedSource.source.id, failed: true, durationMs: Date.now() - startedAt } });
      continue;
    }
    const items = normalizeFeedItems(fetchedSource.items, fetchedSource.source);
    const sourceResult = { fetched: items.length, created: 0, duplicates: 0, autoPublished: 0, humanReview: 0, quarantined: 0 };
    result.fetched += items.length;
    for (const item of items) {
      const persisted = await ingestNormalizedNewsItem(item, fetchedSource.source, author.id);
      if (persisted.outcome === "duplicate") { result.duplicates += 1; sourceResult.duplicates += 1; }
      else if (persisted.outcome === "AUTO_PUBLISH") { result.created += 1; result.autoPublished += 1; sourceResult.created += 1; sourceResult.autoPublished += 1; }
      else if (persisted.outcome === "HUMAN_REVIEW") { result.created += 1; result.queuedForReview += 1; sourceResult.created += 1; sourceResult.humanReview += 1; }
      else { result.created += 1; result.quarantined += 1; sourceResult.created += 1; sourceResult.quarantined += 1; }
    }
    await prisma.ingestionLog.create({ data: { sourceId: fetchedSource.source.id, ...sourceResult, durationMs: Date.now() - startedAt } });
  }
  return result;
}
