// Nettoyage V0.3.0 : depublication ciblee des contenus France 24 anterieurs a Task 059
// qui echouent le filtre "Ancrage Gabon". Ce script est idempotent et ne modifie
// jamais un contenu pertinent ou provenant d'une autre source.
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { computeGabonRelevance } from "../lib/aggregation/gabon-relevance";

const LEGACY_SOURCE_NAME = "France 24 Afrique";

async function main() {
  const [articles, opportunities] = await Promise.all([
    prisma.article.findMany({
      where: { sourceName: LEGACY_SOURCE_NAME, status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null } },
      select: { id: true, title: true, summary: true, content: true, sourceName: true },
    }),
    prisma.opportunity.findMany({
      where: { sourceName: LEGACY_SOURCE_NAME, status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null } },
      select: { id: true, title: true, description: true, sourceName: true },
    }),
  ]);

  const articleIds = articles
    .filter((article) => !computeGabonRelevance({ title: article.title, excerpt: article.summary ?? "", content: article.content, sourceType: "MEDIA", sourceName: article.sourceName ?? LEGACY_SOURCE_NAME }).isRelevant)
    .map((article) => article.id);
  const opportunityIds = opportunities
    .filter((opportunity) => !computeGabonRelevance({ title: opportunity.title, excerpt: opportunity.description, sourceType: "MEDIA", sourceName: opportunity.sourceName ?? LEGACY_SOURCE_NAME }).isRelevant)
    .map((opportunity) => opportunity.id);

  const [articlesUpdated, opportunitiesUpdated] = await Promise.all([
    prisma.article.updateMany({ where: { id: { in: articleIds } }, data: { status: "DRAFT", moderationStatus: "REJECTED", publishedAt: null } }),
    prisma.opportunity.updateMany({ where: { id: { in: opportunityIds } }, data: { status: "DRAFT", moderationStatus: "REJECTED", publishedAt: null } }),
  ]);

  console.log("[cleanup-off-topic-content] result:", {
    articlesScanned: articles.length,
    articlesUnpublished: articlesUpdated.count,
    opportunitiesScanned: opportunities.length,
    opportunitiesUnpublished: opportunitiesUpdated.count,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[cleanup-off-topic-content] failed:", error);
    process.exit(1);
  });
