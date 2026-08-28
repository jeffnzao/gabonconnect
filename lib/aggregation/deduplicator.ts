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