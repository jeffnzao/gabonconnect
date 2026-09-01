import { HistoricalScope, HistoricalStatus, Prisma, SourceLevel } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export const memoryTabs = ["events", "figures", "archives", "diaspora"] as const;
export type MemoryTab = (typeof memoryTabs)[number];

export interface MemoryFilters {
  tab: MemoryTab;
  period?: string;
  status?: HistoricalStatus;
  scope?: HistoricalScope;
  sourceLevel?: SourceLevel;
}

export function isMemoryTab(value: string | undefined): value is MemoryTab {
  return Boolean(value && memoryTabs.includes(value as MemoryTab));
}

export async function getMemoryContent(filters: MemoryFilters) {
  const query = filters.period?.trim();
  const historicalWhere = {
    ...(filters.status ? { historicalStatus: filters.status } : {}),
    ...(filters.scope ? { scope: filters.scope } : {}),
    ...(filters.sourceLevel ? { sourceLevel: filters.sourceLevel } : {}),
  };

  if (filters.tab === "events") {
    return prisma.historicalEvent.findMany({
      where: { ...historicalWhere, ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { period: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] } : {}) },
      orderBy: [{ exactDate: "asc" }, { title: "asc" }],
    });
  }
  if (filters.tab === "figures") {
    return prisma.historicalFigure.findMany({
      where: { ...historicalWhere, ...(query ? { OR: [{ fullName: { contains: query, mode: "insensitive" } }, { category: { contains: query, mode: "insensitive" } }, { biography: { contains: query, mode: "insensitive" } }] } : {}) },
      orderBy: { fullName: "asc" },
    });
  }
  if (filters.tab === "archives") {
    return prisma.historicalArchive.findMany({
      where: { ...(filters.sourceLevel ? { sourceLevel: filters.sourceLevel } : {}), ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { legalNature: { contains: query, mode: "insensitive" } }] } : {}) },
      orderBy: [{ actDate: "asc" }, { title: "asc" }],
    });
  }
  return prisma.diasporaImpact.findMany({
    where: { ...(filters.sourceLevel ? { sourceLevel: filters.sourceLevel } : {}), ...(query ? { OR: [{ country: { contains: query, mode: "insensitive" } }, { city: { contains: query, mode: "insensitive" } }, { period: { contains: query, mode: "insensitive" } }, { domain: { contains: query, mode: "insensitive" } }, { contribution: { contains: query, mode: "insensitive" } }] } : {}) },
    include: { figure: { select: { fullName: true } } },
    orderBy: [{ country: "asc" }, { city: "asc" }],
  });
}

export const historicalStatuses = Object.values(HistoricalStatus);
export const historicalScopes = Object.values(HistoricalScope);
export const sourceLevels = Object.values(SourceLevel);
export type MemoryItem = Awaited<ReturnType<typeof getMemoryContent>>[number];
