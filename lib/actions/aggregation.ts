"use server";

import { ArticleStatus, ContentModerationStatus } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";
import { prisma } from "@/lib/prisma";
import { fetchActiveSources } from "@/lib/aggregation/fetcher";
import { normalizeFeedItems } from "@/lib/aggregation/normalizer";
import { isDuplicate } from "@/lib/aggregation/deduplicator";
import { classifyArticle } from "@/lib/aggregation/classifier";
import { extractEvent } from "@/lib/aggregation/event-extractor";
import { isDuplicateEvent } from "@/lib/aggregation/deduplicator";
import { extractOpportunity } from "@/lib/aggregation/opportunity-extractor";
import { isDuplicateOpportunity } from "@/lib/aggregation/deduplicator";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const user = await ensureUser();
  if (!user || !isAdminRole(user.role)) throw new Error("Admin access required.");
  return user;
}

export async function runAggregationPipeline() {
  const admin = await requireAdmin();
  const sources = await fetchActiveSources();
  let fetched = 0;
  let created = 0;
  let duplicates = 0;
  let failed = 0;
  let eventsCreated = 0;
  let opportunitiesCreated = 0;

  for (const result of sources) {
    if (result.error) {
      failed += 1;
      continue;
    }
    const items = normalizeFeedItems(result.items, result.source);
    fetched += items.length;
    for (const item of items) {
      const event = extractEvent(item);
      if (event) {
        if (await isDuplicateEvent(event)) continue;
        await prisma.event.create({
          data: {
            title: event.title,
            slug: `${item.externalId.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().slice(0, 120) || "aggregated-event"}-${Date.now()}`,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            isVirtual: event.isOnline,
            virtualUrl: event.isOnline ? event.registrationUrl : undefined,
            registrationUrl: event.registrationUrl,
            organizerType: "USER",
            createdById: admin.id,
            status: "DRAFT",
            moderationStatus: ContentModerationStatus.PENDING,
            canonicalUrl: event.canonicalUrl,
            sourceName: event.sourceName,
            copyrightFlag: true,
          },
        });
        eventsCreated += 1;
        continue;
      }
      const opportunity = extractOpportunity(item);
      if (opportunity) {
        if (await isDuplicateOpportunity(opportunity)) {
          duplicates += 1;
          continue;
        }
        if (opportunity.scholarshipLevel) {
          await prisma.scholarship.create({ data: { title: opportunity.title, provider: opportunity.sourceName, country: "GA", level: opportunity.scholarshipLevel, description: opportunity.description, eligibilityCriteria: "See the official announcement.", deadline: opportunity.deadline ?? new Date(Date.now() + 86400000 * 30), applicationUrl: opportunity.applicationUrl, moderationStatus: ContentModerationStatus.PENDING, canonicalUrl: opportunity.canonicalUrl, sourceName: opportunity.sourceName, copyrightFlag: true } });
        } else {
          await prisma.opportunity.create({ data: { title: opportunity.title, slug: `${item.externalId.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().slice(0, 120) || "aggregated-opportunity"}-${Date.now()}`, description: opportunity.description, type: opportunity.type, location: opportunity.location, applicationUrl: opportunity.applicationUrl, createdById: admin.id, status: "DRAFT", moderationStatus: ContentModerationStatus.PENDING, canonicalUrl: opportunity.canonicalUrl, sourceName: opportunity.sourceName, copyrightFlag: true } });
        }
        opportunitiesCreated += 1;
        continue;
      }
      if (await isDuplicate(item)) {
        duplicates += 1;
        continue;
      }
      const slugBase = item.externalId.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase().slice(0, 120) || "aggregated-news";
      await prisma.article.create({
        data: {
          authorId: admin.id,
          title: item.title,
          slug: `${slugBase}-${Date.now()}`,
          summary: item.excerpt,
          content: item.excerpt,
          imageUrl: item.imageUrl,
          category: classifyArticle(item.title, item.excerpt),
          status: ArticleStatus.DRAFT,
          moderationStatus: ContentModerationStatus.PENDING,
          canonicalUrl: item.canonicalUrl,
          sourceName: item.sourceName,
          copyrightFlag: true,
          publishedAt: null,
        },
      });
      created += 1;
    }
  }

  return { sources: sources.length, fetched, created, eventsCreated, opportunitiesCreated, duplicates, failed };
}

export async function runAggregationFromForm(): Promise<void> {
  try {
    await runAggregationPipeline();
    revalidatePath("/admin/sources");
    redirect("/admin/sources?aggregation=success");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    redirect("/admin/sources?aggregation=error");
  }
}
