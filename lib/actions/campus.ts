"use server";

import { ContentModerationStatus, HousingType, ScholarshipLevel } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getScholarships(filters: { level?: ScholarshipLevel; country?: string; provider?: string } = {}) {
  return prisma.scholarship.findMany({
    where: {
      ...(filters.level ? { level: filters.level } : {}),
      ...(filters.country?.trim() ? { country: { contains: filters.country.trim(), mode: "insensitive" } } : {}),
      ...(filters.provider?.trim() ? { provider: { contains: filters.provider.trim(), mode: "insensitive" } } : {}),
      deadline: { gte: new Date() },
      OR: [{ canonicalUrl: null }, { moderationStatus: ContentModerationStatus.APPROVED, publishedAt: { not: null } }],
    },
    orderBy: { deadline: "asc" },
  });
}

export async function getHousingOffers(filters: { city?: string; country?: string; type?: HousingType } = {}) {
  return prisma.housingOffer.findMany({
    where: {
      isAvailable: true,
      ...(filters.city?.trim() ? { city: { contains: filters.city.trim(), mode: "insensitive" } } : {}),
      ...(filters.country?.trim() ? { country: { contains: filters.country.trim(), mode: "insensitive" } } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, city: true, country: true, type: true, price: true, description: true, contactEmail: true, isAvailable: true, createdAt: true, author: { select: { profile: { select: { firstName: true, lastName: true } } } } },
  });
}

export async function createHousingOffer(input: { city: string; country: string; type: HousingType; price: number; description: string; contactEmail: string }) {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  const city = input.city.trim();
  const country = input.country.trim();
  const description = input.description.trim();
  const contactEmail = input.contactEmail.trim();
  if (!city || !country || !description || !contactEmail || !Number.isFinite(input.price) || input.price < 0 || !Object.values(HousingType).includes(input.type)) {
    throw new Error("Invalid housing offer.");
  }
  return prisma.housingOffer.create({ data: { authorId: user.id, city, country, type: input.type, price: input.price, description, contactEmail } });
}
