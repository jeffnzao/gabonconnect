import "dotenv/config";
import { ArticleStatus, ContentModerationStatus, type Prisma } from "../app/generated/prisma";
import { prisma } from "../lib/prisma";
import { evaluateGabonRelevance } from "../lib/relevance/gabon-relevance-engine";

type GreDecision = { score: number; flags: { requires_human_review: boolean }; routing: { primary_target: string } };
const WRITE_BATCH_SIZE = 25;

function isGreDecision(value: Prisma.JsonValue | null): value is Prisma.JsonObject & GreDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const flags = value.flags;
  const routing = value.routing;
  return typeof value.score === "number" && Boolean(flags && typeof flags === "object" && !Array.isArray(flags) && typeof flags.requires_human_review === "boolean") && Boolean(routing && typeof routing === "object" && !Array.isArray(routing) && typeof routing.primary_target === "string");
}

async function main() {
  const [pending, sources] = await Promise.all([
    prisma.article.findMany({ where: { moderationStatus: ContentModerationStatus.PENDING }, select: { id: true, title: true, summary: true, content: true, sourceName: true, canonicalUrl: true } }),
    prisma.sourceRegistry.findMany({ select: { name: true, type: true } }),
  ]);
  const sourceTypes = new Map(sources.map((source) => [source.name, source.type]));
  const publishIds: string[] = [];
  const rejectIds: string[] = [];
  const decisions: Array<{ id: string; relevanceDecision: Prisma.InputJsonValue }> = [];
  let heldForHumanReview = 0;
  for (const article of pending) {
    const sourceType = article.sourceName ? sourceTypes.get(article.sourceName) : undefined;
    if (!sourceType || !article.sourceName) { heldForHumanReview += 1; continue; }
    const decision = evaluateGabonRelevance({ contentId: article.id, domain: "articles", title: article.title, excerpt: article.summary ?? "", content: article.content, sourceType, sourceName: article.sourceName, canonicalUrl: article.canonicalUrl });
    decisions.push({ id: article.id, relevanceDecision: JSON.parse(JSON.stringify(decision)) as Prisma.InputJsonValue });
    if (decision.routing.primary_target === "QUARANTINE" || decision.score <= 0) rejectIds.push(article.id);
    else if (decision.score > 75 && !decision.flags.requires_human_review) publishIds.push(article.id);
    else heldForHumanReview += 1;
  }
  const now = new Date();
  for (let index = 0; index < decisions.length; index += WRITE_BATCH_SIZE) {
    const batch = decisions.slice(index, index + WRITE_BATCH_SIZE);
    await prisma.$transaction(batch.map((article) => prisma.article.update({ where: { id: article.id }, data: { relevanceDecision: article.relevanceDecision } })));
  }
  await prisma.$transaction([
    prisma.article.updateMany({ where: { id: { in: publishIds } }, data: { status: ArticleStatus.PUBLISHED, moderationStatus: ContentModerationStatus.APPROVED, publishedAt: now, archivedAt: null } }),
    prisma.article.updateMany({ where: { id: { in: rejectIds } }, data: { status: ArticleStatus.DRAFT, moderationStatus: ContentModerationStatus.REJECTED, publishedAt: null } }),
  ]);
  console.log("[activate-pending-news]", { inspected: pending.length, published: publishIds.length, rejected: rejectIds.length, heldForHumanReview });
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });