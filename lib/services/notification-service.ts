import { NotificationType, Role, type Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export interface NotificationAudience {
  role?: Role;
  userIds?: string[];
}

export async function createNotificationForUser(userId: string, data: NotificationData) {
  const title = data.title.trim();
  const message = data.message.trim();
  if (!userId || !title || !message) return null;

  const preference = await prisma.notificationPreference.findUnique({
    where: { userId },
    select: { inApp: true },
  });
  if (preference?.inApp === false) return null;

  return prisma.notification.create({
    data: {
      userId,
      type: data.type,
      title,
      message,
      link: data.link?.trim() || undefined,
    },
  });
}

export async function broadcastNotification(data: NotificationData, filter?: NotificationAudience) {
  const where: Prisma.UserWhereInput = {
    ...(filter?.role ? { role: filter.role } : {}),
    ...(filter?.userIds ? { id: { in: filter.userIds } } : {}),
  };
  const users = await prisma.user.findMany({ where, select: { id: true } });
  const notifications = await Promise.all(users.map((user) => createNotificationForUser(user.id, data)));
  return notifications.filter((notification): notification is NonNullable<typeof notification> => notification !== null);
}
