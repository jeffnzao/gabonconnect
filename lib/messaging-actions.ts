"use server";

import { ProfileVisibility, UserStatus } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { canAccessConversation, normalizeParticipantPair } from "@/lib/messaging";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { redirect } from "next/navigation";

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

async function requireConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, participant1Id: true, participant2Id: true },
  });
  if (!conversation || !canAccessConversation(conversation, userId)) throw new Error("Conversation not found.");
  return conversation;
}

export async function getOrCreateConversationForUser(targetUserId: string) {
  const user = await requireUser();
  const target = targetUserId.trim();
  if (!target || target === user.id) throw new Error("Choose another member to contact.");
  const targetUser = await prisma.user.findUnique({ where: { id: target }, select: { id: true, profile: { select: { id: true, visibility: true } } } });
  if (!targetUser?.profile || targetUser.profile.visibility !== ProfileVisibility.PUBLIC) throw new Error("Member is not available for contact.");
  const pair = normalizeParticipantPair(user.id, targetUser.id);
  const conversation = await prisma.conversation.upsert({ where: { participant1Id_participant2Id: pair }, create: pair, update: {}, select: { id: true } });
  redirect(`/messages?conversationId=${conversation.id}`);
}

export async function sendMessage(conversationId: string, content: string): Promise<{ success: true; message: { id: string; conversationId: string; senderId: string; content: string; createdAt: Date } } | { success: false; error: string }> {
  try {
    const user = await requireUser();
    await requireConversation(conversationId, user.id);
    const value = z.string().trim().min(1).max(5000).parse(content);
    const message = await prisma.message.create({ data: { conversationId, senderId: user.id, content: value } });
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return { success: true, message };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to send message." };
  }
}

export async function sendMessageFromForm(conversationId: string, formData: FormData) {
  return sendMessage(conversationId, String(formData.get("content") ?? ""));
}

export async function markConversationAsRead(conversationId: string) {
  const user = await requireUser();
  await requireConversation(conversationId, user.id);
  await prisma.message.updateMany({ where: { conversationId, senderId: { not: user.id }, isRead: false }, data: { isRead: true } });
}

export async function updateMyPresence(status: UserStatus, showStatus: boolean) {
  const user = await requireUser();
  if (!Object.values(UserStatus).includes(status)) throw new Error("Invalid presence status.");
  return prisma.profile.update({ where: { userId: user.id }, data: { status, showStatus } });
}