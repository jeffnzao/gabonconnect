"use server";

import { AssociationStatus, NotificationType, PostType, PostVisibility } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotificationForUser } from "@/lib/services/notification-service";
import { resolveMentionedUserIds } from "@/lib/mentions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function actorDisplayName(userId: string): Promise<string> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { firstName: true, lastName: true },
  });
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();
  return name || "Un membre GabonConnect";
}

async function notifyMentions(content: string, actorUserId: string, actorName: string, link: string) {
  try {
    const mentionedIds = await resolveMentionedUserIds(content, actorUserId);
    await Promise.all(
      mentionedIds.map((userId) =>
        createNotificationForUser(userId, {
          type: NotificationType.NEW_PUBLICATION,
          title: `${actorName} vous a mentionne`,
          message: content.length > 140 ? `${content.slice(0, 139)}…` : content,
          link,
        }),
      ),
    );
  } catch (error) {
    console.error("[feed] failed to notify mentions:", error);
  }
}

const postSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  type: z.enum(["GENERAL", "ANNOUNCEMENT", "EVENT_SHARE", "OPPORTUNITY_SHARE"]).default("GENERAL"),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY"]).default("PUBLIC"),
  associationId: z.string().trim().optional(),
});

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

async function requirePostAccess(postId: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true, visibility: true } });
  if (!post) throw new Error("Post not found.");
  if (post.visibility === PostVisibility.MEMBERS_ONLY && post.authorId !== userId) {
    const profile = await prisma.profile.findUnique({ where: { userId: userId }, select: { id: true } });
    const membership = profile ? await prisma.associationMember.findFirst({ where: { profileId: profile.id }, select: { id: true } }) : null;
    if (!membership) throw new Error("Members-only post access required.");
  }
  return post;
}

export async function createPost(input: unknown) {
  const user = await requireUser();
  const data = postSchema.parse(input);
  if (data.associationId) {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!profile) throw new Error("Complete your profile before posting for an association.");
    const association = await prisma.association.findUnique({ where: { id: data.associationId }, select: { status: true } });
    if (!association || association.status !== AssociationStatus.APPROVED) throw new Error("Only approved associations can publish posts.");
    const member = await prisma.associationMember.findUnique({ where: { associationId_profileId: { associationId: data.associationId, profileId: profile.id } }, select: { id: true } });
    if (!member) throw new Error("You must be an association member to post for it.");
  }
  const post = await prisma.post.create({ data: { content: data.content, type: PostType[data.type], visibility: PostVisibility[data.visibility], authorId: user.id, associationId: data.associationId || undefined } });
  revalidatePath("/feed");
  await notifyMentions(data.content, user.id, await actorDisplayName(user.id), "/feed");
  return post;
}

export async function togglePostLike(postId: string) {
  const user = await requireUser();
  const post = await requirePostAccess(postId, user.id);
  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "posts" WHERE "id" = ${postId} FOR UPDATE`;
    const existing = await tx.postLike.findUnique({ where: { postId_userId: { postId, userId: user.id } }, select: { id: true } });
    if (existing) {
      await tx.postLike.delete({ where: { id: existing.id } });
      revalidatePath("/feed");
      return { liked: false };
    }
    await tx.postLike.create({ data: { postId, userId: user.id } });
    revalidatePath("/feed");
    return { liked: true };
  });

  if (result.liked && post.authorId !== user.id) {
    try {
      const actorName = await actorDisplayName(user.id);
      await createNotificationForUser(post.authorId, {
        type: NotificationType.NEW_PUBLICATION,
        title: `${actorName} a reagi a votre publication`,
        message: "Votre publication a recu une nouvelle reaction.",
        link: "/feed",
      });
    } catch (error) {
      console.error("[feed] failed to notify post reaction:", error);
    }
  }

  return result;
}

export async function addPostComment(postId: string, content: string) {
  const user = await requireUser();
  const post = await requirePostAccess(postId, user.id);
  const value = z.string().trim().min(1).max(2000).parse(content);
  const comment = await prisma.postComment.create({ data: { postId, authorId: user.id, content: value } });
  revalidatePath("/feed");

  const actorName = await actorDisplayName(user.id);
  if (post.authorId !== user.id) {
    try {
      await createNotificationForUser(post.authorId, {
        type: NotificationType.NEW_PUBLICATION,
        title: `${actorName} a commente votre publication`,
        message: value.length > 140 ? `${value.slice(0, 139)}…` : value,
        link: "/feed",
      });
    } catch (error) {
      console.error("[feed] failed to notify post comment:", error);
    }
  }
  await notifyMentions(value, user.id, actorName, "/feed");

  return comment;
}

export async function deletePost(postId: string) {
  const user = await requireUser();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) throw new Error("Post not found.");
  if (post.authorId !== user.id && user.role !== "ADMIN") throw new Error("Not authorized to delete this post.");
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/feed");
}
