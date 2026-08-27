"use server";

import { ConsulateType, type Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function getConsulates(filters: { country?: string; type?: ConsulateType } = {}) {
  const where: Prisma.ConsulateWhereInput = {
    ...(filters.country?.trim() ? { country: { contains: filters.country.trim(), mode: "insensitive" } } : {}),
    ...(filters.type ? { type: filters.type } : {}),
  };
  return prisma.consulate.findMany({ where, orderBy: [{ country: "asc" }, { city: "asc" }], select: { id: true, name: true, type: true, country: true, city: true, address: true, phone: true, email: true, website: true, openingHours: true, jurisdiction: true, latitude: true, longitude: true } });
}
