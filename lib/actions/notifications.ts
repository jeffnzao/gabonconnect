"use server";

import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

function parseLimit(limit?: number) {
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit ?? DEFAULT_LIMIT)));
}

export async function getUserNotifications(options?: { limit?: number; page?: number }) {
  const user = await requireUser();
  const limit = parseLimit(options?.limit);
  const page = Math.max(1, Math.floor(options?.page ?? 1));

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      link: true,
      isRead: true,
      createdAt: true,
    },
  });
}

export async function getUnreadNotificationCount() {
  const user = await requireUser();
  return prisma.notification.count({ where: { userId: user.id, isRead: false } });
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireUser();
  const id = notificationId.trim();
  if (!id) throw new Error("Notification id is required.");

  return prisma.notification.updateMany({
    where: { id, userId: user.id, isRead: false },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead() {
  const user = await requireUser();
  return prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
}

export async function getUserNotificationPreferences() {
  const user = await requireUser();
  return prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
    select: { inApp: true, email: true, push: true, updatedAt: true },
  });
}

export async function updateUserNotificationPreferences(input: {
  inApp: boolean;
  email: boolean;
  push: boolean;
}) {
  const user = await requireUser();
  if (![input.inApp, input.email, input.push].every((value) => typeof value === "boolean")) {
    throw new Error("Invalid notification preferences.");
  }

  return prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...input },
    update: input,
    select: { inApp: true, email: true, push: true, updatedAt: true },
  });
}

