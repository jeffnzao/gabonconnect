import { cache } from "react";
import { AdministrativeProcedureCategory, type Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export const procedureCategories = Object.values(AdministrativeProcedureCategory);

export const getProcedures = cache(async (filters: { query?: string; category?: AdministrativeProcedureCategory } = {}) => {
  const query = filters.query?.trim();
  const where: Prisma.AdministrativeProcedureWhereInput = {
    ...(filters.category ? { category: filters.category } : {}),
    ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] } : {}),
  };

  return prisma.administrativeProcedure.findMany({
    where,
    orderBy: { title: "asc" },
    select: { id: true, slug: true, title: true, description: true, category: true, estimatedDays: true, cost: true, officialUrl: true, _count: { select: { steps: true } } },
  });
});

export const getProcedureBySlug = cache(async (slug: string, userId?: string) => {
  const procedure = await prisma.administrativeProcedure.findUnique({
    where: { slug },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!procedure) return null;

  const progress = userId ? await prisma.userProcedureProgress.findUnique({ where: { userId_procedureId: { userId, procedureId: procedure.id } } }) : null;
  return { ...procedure, progress };
});

