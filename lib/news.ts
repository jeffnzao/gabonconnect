import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma";
import { ArticleCategory, ArticleStatus } from "@/app/generated/prisma";

const PUBLIC_ARTICLE = { status: ArticleStatus.PUBLISHED, publishedAt: { not: null } } as const;

export const getPublishedArticles = cache(async (options?: { query?: string; category?: ArticleCategory; sort?: "recent" | "popular"; page?: number; pageSize?: number }) => {
  try {
    const pageSize = options?.pageSize ?? 50;
    const page = Math.max(1, options?.page ?? 1);
    const query = options?.query?.trim();
    return await prisma.article.findMany({
      where: PUBLIC_ARTICLE,
      ...(query ? { where: { ...PUBLIC_ARTICLE, OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }] } } : {}),
      ...(options?.category ? { where: { ...PUBLIC_ARTICLE, category: options.category, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { summary: { contains: query, mode: "insensitive" } }] } : {}) } } : {}),
      orderBy: options?.sort === "popular" ? { viewCount: "desc" } : { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, slug: true, title: true, summary: true, content: true, imageUrl: true, category: true, viewCount: true, publishedAt: true },
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