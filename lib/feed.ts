import { cache } from "react";
import { PostType, PostVisibility, Prisma } from "@/app/generated/prisma";
import { isMissingTableError, prisma } from "@/lib/prisma";

export interface FeedFilters {
  type?: PostType;
  page?: number;
  pageSize?: number;
}

export interface FeedViewer {
  id: string;
  isMember: boolean;
}

export const PUBLIC_POST_SELECT = {
  id: true,
  content: true,
  type: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, profile: { select: { firstName: true, lastName: true, photo: true } } } },
  association: { select: { id: true, name: true, slug: true } },
  comments: { orderBy: { createdAt: "asc" }, take: 20, select: { id: true, content: true, createdAt: true, author: { select: { profile: { select: { firstName: true, lastName: true, photo: true } } } } } },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostSelect;

export function canViewPost(visibility: PostVisibility, viewer: FeedViewer | null, authorId: string): boolean {
  return visibility === PostVisibility.PUBLIC || Boolean(viewer && (viewer.isMember || viewer.id === authorId));
}

export function buildFeedWhere(filters: FeedFilters, viewer: FeedViewer | null): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {
    OR: [
      { visibility: PostVisibility.PUBLIC },
      ...(viewer ? [{ visibility: PostVisibility.MEMBERS_ONLY }] : []),
    ],
  };
  if (filters.type) where.type = filters.type;
  return where;
}

export const getFeedPosts = cache(async (filters: FeedFilters = {}, viewer: FeedViewer | null = null) => {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 50);
  const page = Math.max(Math.floor(filters.page ?? 1), 1);
  let posts;
  try {
    posts = await prisma.post.findMany({
      where: buildFeedWhere(filters, viewer),
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: PUBLIC_POST_SELECT,
    });
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  const visiblePosts = viewer ? posts : posts.filter((post) => post.visibility === PostVisibility.PUBLIC);
  const likes = viewer && visiblePosts.length > 0
    ? await prisma.postLike.findMany({ where: { postId: { in: visiblePosts.map((post) => post.id) }, userId: viewer.id }, select: { postId: true } })
    : [];
  const likedIds = new Set(likes.map((like) => like.postId));

  return visiblePosts.map((post) => ({ ...post, hasLiked: likedIds.has(post.id) }));
});

export const getPostComments = cache(async (postId: string) =>
  prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true, createdAt: true, author: { select: { id: true, profile: { select: { firstName: true, lastName: true, photo: true } } } } },
  }),
);