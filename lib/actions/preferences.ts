"use server";

import { z } from "zod";
import { MemberStatus, NotificationChannel } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

const PREFERENCES_SELECT = {
  countryId: true,
  cityId: true,
  memberStatus: true,
  interests: true,
  preferredChannels: true,
  updatedAt: true,
} as const;

const updatePreferencesSchema = z.object({
  countryId: z.string().trim().min(1).nullable().optional(),
  cityId: z.string().trim().min(1).nullable().optional(),
  memberStatus: z.nativeEnum(MemberStatus).optional(),
  interests: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  preferredChannels: z.array(z.nativeEnum(NotificationChannel)).min(1).max(3).optional(),
});

export type UpdateUserPreferencesInput = z.infer<typeof updatePreferencesSchema>;

export async function getUserPreferences() {
  const user = await requireUser();
  return prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
    select: PREFERENCES_SELECT,
  });
}

export async function updateUserPreferences(input: UpdateUserPreferencesInput) {
  const user = await requireUser();
  const data = updatePreferencesSchema.parse(input);

  // A city always determines its country to keep location fields consistent.
  if (data.cityId) {
    const city = await prisma.city.findUnique({ where: { id: data.cityId }, select: { id: true, countryId: true } });
    if (!city) throw new Error("Invalid city.");
    if (data.countryId && data.countryId !== city.countryId) throw new Error("City does not belong to the selected country.");
    data.countryId = city.countryId;
  } else if (data.countryId) {
    const country = await prisma.country.findUnique({ where: { id: data.countryId }, select: { id: true } });
    if (!country) throw new Error("Invalid country.");
  }

  return prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
    select: PREFERENCES_SELECT,
  });
}
