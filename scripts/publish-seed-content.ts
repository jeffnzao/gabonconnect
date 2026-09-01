// Internal CLI: approves a starter batch of aggregated content so /news, /events and
// /opportunities are non-empty on the frontend, and seeds a few institutional sample events.
// Run with: npx tsx scripts/publish-seed-content.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { ArticleStatus, ContentModerationStatus, EventStatus, OpportunityStatus } from "../app/generated/prisma";

const SYSTEM_AGGREGATION_USER_ID = "system-aggregation";
const SYSTEM_AGGREGATION_USER_EMAIL = "aggregation-system@gabonconnect.internal";

const SAMPLE_EVENTS = [
  {
    title: "Journee de la diaspora gabonaise",
    description: "Rencontre institutionnelle annuelle reunissant les associations de la diaspora gabonaise.",
    location: "Paris, France",
    daysFromNow: 14,
  },
  {
    title: "Forum des etudiants gabonais a l'etranger",
    description: "Echanges sur les bourses, l'orientation academique et l'insertion professionnelle.",
    location: "Bruxelles, Belgique",
    daysFromNow: 21,
  },
  {
    title: "Ceremonie consulaire d'accueil des nouveaux arrivants",
    description: "Session d'information administrative organisee par le consulat du Gabon.",
    location: "Montreal, Canada",
    daysFromNow: 28,
  },
];

async function getSystemAggregationUser() {
  return prisma.user.upsert({
    where: { id: SYSTEM_AGGREGATION_USER_ID },
    create: { id: SYSTEM_AGGREGATION_USER_ID, email: SYSTEM_AGGREGATION_USER_EMAIL, role: "ADMIN" },
    update: {},
  });
}

async function approveArticles(count: number) {
  const pending = await prisma.article.findMany({
    where: { moderationStatus: ContentModerationStatus.PENDING },
    orderBy: { createdAt: "asc" },
    take: count,
    select: { id: true },
  });
  if (pending.length === 0) return 0;
  await prisma.article.updateMany({
    where: { id: { in: pending.map((a) => a.id) } },
    data: { moderationStatus: ContentModerationStatus.APPROVED, status: ArticleStatus.PUBLISHED, publishedAt: new Date() },
  });
  return pending.length;
}

async function approveOpportunities(count: number) {
  const pending = await prisma.opportunity.findMany({
    where: { moderationStatus: ContentModerationStatus.PENDING },
    orderBy: { createdAt: "asc" },
    take: count,
    select: { id: true },
  });
  if (pending.length === 0) return 0;
  await prisma.opportunity.updateMany({
    where: { id: { in: pending.map((o) => o.id) } },
    data: { moderationStatus: ContentModerationStatus.APPROVED, status: OpportunityStatus.PUBLISHED, publishedAt: new Date() },
  });
  return pending.length;
}

async function seedSampleEvents(admin: { id: string }) {
  let created = 0;
  for (const sample of SAMPLE_EVENTS) {
    const slug = sample.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .toLowerCase()
      .slice(0, 120);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) continue;
    const startDate = new Date(Date.now() + sample.daysFromNow * 86400000);
    await prisma.event.create({
      data: {
        title: sample.title,
        slug,
        description: sample.description,
        startDate,
        location: sample.location,
        isVirtual: false,
        organizerType: "USER",
        createdById: admin.id,
        status: EventStatus.PUBLISHED,
        moderationStatus: ContentModerationStatus.APPROVED,
        publishedAt: new Date(),
        sourceName: "GabonConnect Institutionnel",
      },
    });
    created += 1;
  }
  return created;
}

async function main() {
  const admin = await getSystemAggregationUser();
  const articlesApproved = await approveArticles(10);
  const opportunitiesApproved = await approveOpportunities(5);
  const eventsCreated = await seedSampleEvents(admin);

  console.log("[publish-seed-content] result:", { articlesApproved, opportunitiesApproved, eventsCreated });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[publish-seed-content] failed:", error);
    process.exit(1);
  });
