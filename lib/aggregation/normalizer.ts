import type { SourceRegistryType } from "@/app/generated/prisma";

export interface RawFeedItem { title?: string; description?: string; link?: string; guid?: string; pubDate?: string; publishedAt?: string; imageUrl?: string; }
export interface NormalizedFeedItem { title: string; excerpt: string; canonicalUrl: string; sourceName: string; publishedAt: Date; imageUrl?: string; domain: "articles"; category?: string; externalId: string; }

const html = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
export function normalizeFeedItems(items: RawFeedItem[], source: { id: string; name: string; type: SourceRegistryType; url: string }): NormalizedFeedItem[] {
  return items.flatMap((item) => {
    const title = html(item.title ?? "").slice(0, 240);
    const excerpt = html(item.description ?? "").slice(0, 500);
    const canonicalUrl = (item.link ?? "").trim();
    if (!title || !canonicalUrl || !/^https?:\/\//i.test(canonicalUrl)) return [];
    const parsedDate = new Date(item.pubDate ?? item.publishedAt ?? Date.now());
    return [{ title, excerpt, canonicalUrl, sourceName: source.name, publishedAt: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate, imageUrl: item.imageUrl, domain: "articles", externalId: item.guid?.trim() || canonicalUrl }];
  });
}

export function parseFeedPayload(payload: string, contentType = ""): RawFeedItem[] {
  if (contentType.includes("json")) {
    const parsed = JSON.parse(payload) as { items?: RawFeedItem[]; articles?: RawFeedItem[] };
    return parsed.items ?? parsed.articles ?? [];
  }
  return [...payload.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)].map((match) => {
    const block = match[0];
    const read = (tag: string) => html(block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");
    const link = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1] ?? read("link");
    return { title: read("title"), description: read("description") || read("summary") || read("content"), link, guid: read("guid") || read("id"), pubDate: read("pubDate") || read("published") };
  });
}