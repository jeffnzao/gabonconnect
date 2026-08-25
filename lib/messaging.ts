import { cache } from "react";
import { ProfileVisibility, UserStatus, Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface ParticipantPair {
  participant1Id: string;
  participant2Id: string;
}

export function normalizeParticipantPair(firstUserId: string, secondUserId: string): ParticipantPair {
  if (firstUserId === secondUserId) throw new Error("A conversation requires two different users.");
  return firstUserId < secondUserId
    ? { participant1Id: firstUserId, participant2Id: secondUserId }
    : { participant1Id: secondUserId, participant2Id: firstUserId };
}

export function canAccessConversation(conversation: ParticipantPair, userId: string): boolean {
  return conversation.participant1Id === userId || conversation.participant2Id === userId;
}

export function visibleUserStatus(status: UserStatus, showStatus: boolean): UserStatus | null {
  return showStatus ? status : null;
}

export function countUnreadMessages(messages: Array<{ senderId: string; isRead: boolean }>, userId: string): number {
  return messages.filter((message) => message.senderId !== userId && !message.isRead).length;
}

const PROFILE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  photo: true,
  status: true,
  showStatus: true,
  visibility: true,
} as const;

const USER_SELECT = {
  id: true,
  profile: { select: PROFILE_SELECT },
} as const;

export const getOrCreateConversation = cache(async (currentUserId: string, targetUserId: string) => {
  const pair = normalizeParticipantPair(currentUserId, targetUserId);
  return prisma.conversation.upsert({
    where: { participant1Id_participant2Id: pair },
    create: pair,
    update: {},
    select: { id: true, participant1Id: true, participant2Id: true },
  });
});

export const getUserConversations = cache(async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      participant1Id: true,
      participant2Id: true,
      updatedAt: true,
      participant1: { select: USER_SELECT },
      participant2: { select: USER_SELECT },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true, isRead: true },
      },
      _count: {
        select: {
          messages: { where: { senderId: { not: userId }, isRead: false } },
        },
      },
    },
  });

  return conversations.map((conversation) => {
    const other = conversation.participant1Id === userId
      ? conversation.participant2
      : conversation.participant1;
    const latestMessage = conversation.messages[0] ?? null;
    return {
      id: conversation.id,
      updatedAt: conversation.updatedAt,
      otherUser: other,
      latestMessage,
      unreadCount: conversation._count.messages,
    };
  });
});

export const getConversationMessages = cache(async (conversationId: string, userId: string) => {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, OR: [{ participant1Id: userId }, { participant2Id: userId }] },
    select: { id: true, participant1Id: true, participant2Id: true },
  });
  if (!conversation) throw new Error("Conversation not found.");

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true, senderId: true, isRead: true, createdAt: true },
  });
  return { conversation, messages };
});

export function buildConversationParticipantWhere(conversationId: string, userId: string): Prisma.ConversationWhereInput {
  return { id: conversationId, OR: [{ participant1Id: userId }, { participant2Id: userId }] };
}

export function getPublicStatus(profile: { status: UserStatus; showStatus: boolean; visibility: ProfileVisibility }) {
  return profile.visibility === ProfileVisibility.PUBLIC
    ? visibleUserStatus(profile.status, profile.showStatus)
    : null;
}