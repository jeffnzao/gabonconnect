// Reindexation globale RAG (Task 061) : indexe tous les contenus deja approuves/publies.
// Run with: npm run rag:reindex
import "dotenv/config";
import { EmbeddingSourceType } from "../app/generated/prisma";
import { prisma } from "../lib/prisma";
import { indexContentForRAG } from "../lib/ai/vector-store";

async function main() {
  const [articles, events, opportunities, scholarships, procedures] = await Promise.all([
    prisma.article.findMany({ where: { status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null } }, select: { id: true } }),
    prisma.event.findMany({ where: { status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null } }, select: { id: true } }),
    prisma.opportunity.findMany({ where: { status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null } }, select: { id: true } }),
    prisma.scholarship.findMany({ where: { moderationStatus: "APPROVED", publishedAt: { not: null } }, select: { id: true } }),
    prisma.administrativeProcedure.findMany({ where: { moderationStatus: "APPROVED", publishedAt: { not: null } }, select: { id: true } }),
  ]);

  const jobs = [
    { sourceType: EmbeddingSourceType.ARTICLE, ids: articles.map((row) => row.id) },
    { sourceType: EmbeddingSourceType.EVENT, ids: events.map((row) => row.id) },
    { sourceType: EmbeddingSourceType.OPPORTUNITY, ids: opportunities.map((row) => row.id) },
    { sourceType: EmbeddingSourceType.SCHOLARSHIP, ids: scholarships.map((row) => row.id) },
    { sourceType: EmbeddingSourceType.ADMINISTRATIVE_PROCEDURE, ids: procedures.map((row) => row.id) },
  ];

  let itemsIndexed = 0;
  let totalChunks = 0;
  for (const job of jobs) {
    for (const id of job.ids) {
      const result = await indexContentForRAG(job.sourceType, id);
      if (result.chunksIndexed > 0) itemsIndexed += 1;
      totalChunks += result.chunksIndexed;
    }
  }

  console.log("[rag:reindex] result:", { itemsIndexed, totalChunks, provider: process.env.OPENAI_API_KEY ? "openai" : "local-fallback" });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[rag:reindex] failed:", error);
    process.exit(1);
  });
