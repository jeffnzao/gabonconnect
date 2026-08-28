import { ArticleStatus, ContentModerationStatus } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function getAggregatedAlerts(options: { categories?: string[]; limit?: number } = {}) {
  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      moderationStatus: ContentModerationStatus.APPROVED,
      publishedAt: { not: null },
      canonicalUrl: { not: null },
      ...(options.categories?.length ? { category: { in: options.categories as never[] } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: Math.min(12, Math.max(1, options.limit ?? 6)),
    select: { id: true, title: true, summary: true, canonicalUrl: true, sourceName: true, publishedAt: true, category: true },
  });
  const sourceNames = [...new Set(articles.map((article) => article.sourceName).filter((name): name is string => Boolean(name)))];
  const sources = sourceNames.length ? await prisma.sourceRegistry.findMany({ where: { name: { in: sourceNames } }, select: { name: true, reliability: true } }) : [];
  const reliability = new Map(sources.map((source) => [source.name, source.reliability]));
  return articles.map((article) => ({ ...article, reliability: article.sourceName ? reliability.get(article.sourceName) ?? null : null }));
}

export async function getAggregatedScholarships(limit = 6) {
  return prisma.scholarship.findMany({
    where: { moderationStatus: ContentModerationStatus.APPROVED, publishedAt: { not: null }, canonicalUrl: { not: null }, deadline: { gte: new Date() } },
    orderBy: { deadline: "asc" },
    take: Math.min(12, Math.max(1, limit)),
    select: { id: true, title: true, provider: true, country: true, deadline: true, applicationUrl: true, canonicalUrl: true, sourceName: true },
  });
}
