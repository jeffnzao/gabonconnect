import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/news";
import { getOpportunities } from "@/lib/opportunities";
import { getEvents } from "@/lib/events";
import { getAssociations } from "@/lib/actions/associations";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  let opportunities: Awaited<ReturnType<typeof getOpportunities>> = [];
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let associations: Awaited<ReturnType<typeof getAssociations>> = [];
  try {
    [articles, opportunities, events, associations] = await Promise.all([
      getPublishedArticles({ pageSize: 500 }),
      getOpportunities(),
      getEvents({ upcomingOnly: true }),
      getAssociations(),
    ]);
  } catch {
    // Keep core URLs available when the database is temporarily offline.
  }

  const entries: MetadataRoute.Sitemap = ["/", "/news", "/opportunities", "/events", "/associations", "/consulates", "/members", "/explore", "/procedures/passeport-renouvellement", "/procedures/immatriculation-consulaire"].map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 }));
  return [...entries, ...articles.map((item) => ({ url: `${baseUrl}/news/${item.slug}`, lastModified: item.publishedAt ?? undefined, changeFrequency: "monthly" as const, priority: 0.6 })), ...opportunities.map((item) => ({ url: `${baseUrl}/opportunities/${item.slug}`, lastModified: item.createdAt, changeFrequency: "weekly" as const, priority: 0.6 })), ...events.map((item) => ({ url: `${baseUrl}/events/${item.slug}`, lastModified: item.startDate, changeFrequency: "weekly" as const, priority: 0.6 })), ...associations.map((item) => ({ url: `${baseUrl}/associations/${item.slug}`, changeFrequency: "monthly" as const, priority: 0.5 }))];
}
