import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma";
import { cleanExcerpt, cleanHtmlText, excerptFromTitle } from "@/lib/html-clean";
import { ArticleCategory, ArticleStatus } from "@/app/generated/prisma";

const PUBLIC_ARTICLE = { status: ArticleStatus.PUBLISHED, publishedAt: { not: null }, moderationStatus: "APPROVED" } as const;

// Le contenu cree manuellement (sans sourceName RSS) passe en priorite d'affichage sur les flux automatiques.
const CONTENT_PRIORITY_ORDER = [{ sourceName: { sort: "asc", nulls: "first" } }, { publishedAt: "desc" }] as const;

type ArticleForDisplay = {
  title: string;
  summary: string | null;
  content?: string;
  [key: string]: unknown;
};

function sanitizeArticle<T extends ArticleForDisplay>(article: T): T {
  const summary = cleanExcerpt(article.summary, article.title, 500) || excerptFromTitle(article.title, 160);
  return {
    ...article,
    summary: summary || null,
    ...(typeof article.content === "string" ? { content: cleanHtmlText(article.content) || article.content } : {}),
  };
}

export const getPublishedArticles = cache(async (options?: { query?: string; category?: ArticleCategory; sort?: "recent" | "popular"; page?: number; pageSize?: number }) => {
  try {
    const pageSize = options?.pageSize ?? 50;
    const page = Math.max(1, options?.page ?? 1);
    const query = options?.query?.trim();
    const rows = await prisma.article.findMany({
      where: PUBLIC_ARTICLE,
      ...(query ? { where: { ...PUBLIC_ARTICLE, OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }] } } : {}),
      ...(options?.category ? { where: { ...PUBLIC_ARTICLE, category: options.category, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }] } : {}) } } : {}),
      orderBy: options?.sort === "popular" ? [{ viewCount: "desc" }] : [...CONTENT_PRIORITY_ORDER],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, slug: true, title: true, summary: true, content: true, imageUrl: true, category: true, viewCount: true, publishedAt: true, sourceName: true, canonicalUrl: true },
    });
    return rows.map(sanitizeArticle);
  } catch (error) {
    if (
      isMissingTableError(error) ||
      (error instanceof Error && error.message.includes("DATABASE_URL"))
    ) {
      return [];
    }
    throw error;
  }
});

export const getPublishedArticleBySlug = cache(async (slug: string) => {
  try {
    const article = await prisma.article.findFirst({
      where: { ...PUBLIC_ARTICLE, slug },
      select: { id: true, slug: true, title: true, summary: true, content: true, imageUrl: true, publishedAt: true, sourceName: true, canonicalUrl: true },
    });
    return article ? sanitizeArticle(article) : null;
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
});
