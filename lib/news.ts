import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma";
import { ArticleStatus } from "@/app/generated/prisma";

const PUBLIC_ARTICLE = { status: ArticleStatus.PUBLISHED, publishedAt: { not: null } } as const;

export const getPublishedArticles = cache(async () => {
  try {
    return await prisma.article.findMany({
      where: PUBLIC_ARTICLE,
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, summary: true, imageUrl: true, publishedAt: true },
    });
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
});

export const getPublishedArticleBySlug = cache(async (slug: string) => {
  try {
    return await prisma.article.findFirst({
      where: { ...PUBLIC_ARTICLE, slug },
      select: { id: true, slug: true, title: true, summary: true, content: true, imageUrl: true, publishedAt: true },
    });
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
});