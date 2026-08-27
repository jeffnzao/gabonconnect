"use server";

import { revalidatePath } from "next/cache";
import { AssociationStatus, EventOrganizerType, EventParticipantStatus, EventStatus } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canOrganizeAssociationEvent, hasEventCapacity } from "@/lib/events";
import { z } from "zod";
import { createNotificationForUser } from "@/lib/services/notification-service";

const eventSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  location: z.string().trim().min(1).max(200),
  isVirtual: z.boolean().default(false),
  virtualUrl: z.string().trim().url().optional(),
  organizerType: z.enum(["ASSOCIATION", "USER"]),
  associationId: z.string().trim().optional(),
  maxParticipants: z.coerce.number().int().positive().optional(),
});

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function createEvent(input: unknown) {
  const user = await requireUser();
  const data = eventSchema.parse(input);
  if (data.endDate && data.endDate <= data.startDate) throw new Error("Event end date must be after its start date.");
  if (data.isVirtual && !data.virtualUrl) throw new Error("Virtual events require a virtual URL.");
  if (!data.isVirtual && data.virtualUrl) throw new Error("Only virtual events can have a virtual URL.");

  if (data.organizerType === "ASSOCIATION") {
    if (!data.associationId) throw new Error("Association organizer requires an association.");
    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!profile) throw new Error("Complete your profile before creating an association event.");
    const association = await prisma.association.findUnique({
      where: { id: data.associationId },
      select: { status: true },
    });
    if (!association || association.status !== AssociationStatus.APPROVED) {
      throw new Error("Only approved associations can organize events.");
    }
    const membership = await prisma.associationMember.findUnique({
      where: { associationId_profileId: { associationId: data.associationId, profileId: profile.id } },
      select: { id: true },
    });
    if (!canOrganizeAssociationEvent(Boolean(membership))) throw new Error("You must be an association member to create this event.");
  } else if (data.associationId) {
    throw new Error("User events cannot include an association.");
  }

  const createdEvent = await prisma.event.create({
    data: {
      ...data,
      organizerType: EventOrganizerType[data.organizerType],
      status: EventStatus.PUBLISHED,
      endDate: data.endDate,
      associationId: data.associationId,
      createdById: user.id,
    },
  });

  revalidatePath("/events");
  revalidatePath("/events/[slug]");

  return createdEvent;
}

export async function toggleEventParticipation(
  eventId: string,
  previousStatus: "GOING" | "MAYBE" | "DECLINED" | null,
  formData: FormData,
) {
  const status = String(formData.get("status") ?? "");
  if (!["GOING", "MAYBE", "DECLINED"].includes(status)) throw new Error("Invalid participation status.");
  const nextStatus = status as "GOING" | "MAYBE" | "DECLINED";

  try {
    const user = await requireUser();
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { title: true, slug: true, createdById: true, status: true, maxParticipants: true, _count: { select: { participants: { where: { status: EventParticipantStatus.GOING } } } } } });
    if (!event || event.status !== EventStatus.PUBLISHED) throw new Error("Event is not available.");
    if (nextStatus === "GOING" && previousStatus !== "GOING" && !hasEventCapacity(event.maxParticipants, event._count.participants)) throw new Error("This event is full.");

    await prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId, userId: user.id } },
      create: { eventId, userId: user.id, status: EventParticipantStatus[nextStatus] },
      update: { status: EventParticipantStatus[nextStatus] },
    });

    if (event.createdById !== user.id && nextStatus !== "DECLINED") {
      try {
        await createNotificationForUser(user.id === event.createdById ? user.id : event.createdById, {
          type: "EVENT",
          title: event.title,
          message: event.title,
          link: `/events/${event.slug}`,
        });
      } catch (error) {
        console.error("Failed to emit event notification:", error);
      }
    }

    revalidatePath("/events");
    revalidatePath("/events/[slug]");
    revalidatePath("/dashboard");

    return nextStatus;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Could not update event participation.");
  }
}