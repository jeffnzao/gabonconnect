import { prisma } from "@/lib/prisma";
import type { SourceRegistryType } from "@/app/generated/prisma";
import { parseFeedPayload, type RawFeedItem } from "./normalizer";

const TIMEOUT_MS = 10000;
export interface FetchedSource { source: { id: string; name: string; type: SourceRegistryType; url: string }; items: RawFeedItem[]; error?: string; }

export async function fetchActiveSources(audience?: "CAMPUS" | "DIASPORA" | "ADMINISTRATIVE"): Promise<FetchedSource[]> {
  const sources = await prisma.sourceRegistry.findMany({ where: { active: true, ...(audience ? { targetAudiences: { has: audience } } : {}) }, orderBy: { name: "asc" } });
  return Promise.all(sources.map(async (source) => {
    try {
      const response = await fetch(source.rssUrl || source.url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: "application/rss+xml, application/atom+xml, application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.text();
      await prisma.sourceRegistry.update({ where: { id: source.id }, data: { lastFetchedAt: new Date() } });
      return { source, items: parseFeedPayload(payload, response.headers.get("content-type") || "") };
    } catch (error) {
      return { source, items: [], error: error instanceof Error ? error.message : "Fetch failed" };
    }
  }));
}