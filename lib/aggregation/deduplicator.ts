import { prisma } from "@/lib/prisma";
import type { NormalizedFeedItem } from "./normalizer";

function tokens(value: string) { return new Set(value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\W+/).filter((token) => token.length > 2)); }
function similarity(first: string, second: string) { const a = tokens(first); const b = tokens(second); const union = new Set([...a, ...b]); return union.size ? [...a].filter((token) => b.has(token)).length / union.size : 0; }

export async function isDuplicate(item: NormalizedFeedItem) {
  const byUrl = await prisma.article.findFirst({ where: { OR: [{ canonicalUrl: item.canonicalUrl }, { slug: item.externalId }] }, select: { id: true } });
  if (byUrl) return true;
  const candidates = await prisma.article.findMany({ where: { title: { contains: item.title.slice(0, 40), mode: "insensitive" } }, select: { title: true }, take: 10 });
  return candidates.some((candidate) => similarity(candidate.title, item.title) >= 0.8);
}

export async function isDuplicateEvent(event: { title: string; startDate: Date; location: string }) {
  const candidates = await prisma.event.findMany({ where: { startDate: { gte: new Date(event.startDate.getTime() - 86400000), lte: new Date(event.startDate.getTime() + 86400000) }, location: { contains: event.location === "Online" ? "Online" : event.location.slice(0, 30), mode: "insensitive" } }, select: { title: true, startDate: true, location: true }, take: 20 });
  return candidates.some((candidate) => similarity(candidate.title, event.title) >= 0.8 && candidate.location.toLowerCase() === event.location.toLowerCase());
}

export async function isDuplicateOpportunity(item: { title: string; applicationUrl: string; sourceName: string }) {
  const existing = await prisma.opportunity.findFirst({ where: { OR: [{ applicationUrl: item.applicationUrl }, { AND: [{ title: { contains: item.title.slice(0, 40), mode: "insensitive" } }, { sourceName: item.sourceName }] }] }, select: { id: true } });
  if (existing) return true;
  const scholarship = await prisma.scholarship.findFirst({ where: { OR: [{ applicationUrl: item.applicationUrl }, { AND: [{ title: { contains: item.title.slice(0, 40), mode: "insensitive" } }, { provider: item.sourceName }] }] }, select: { id: true } });
  return Boolean(scholarship);
}