import { cache } from "react";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type FeedItem = { id: string; title: string; detail: string; href: string; reason: string };

function includes(value: string, candidate: string | null | undefined) { return Boolean(candidate && value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(candidate.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())); }

export const getPersonalizedFeed = cache(async () => {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");
  const preferences = await prisma.userPreferences.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {}, include: { city: { include: { country: true } }, country: true } });
  const [articles, events, opportunities, procedures, scholarships] = await Promise.all([
    prisma.article.findMany({ where: { status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null } }, orderBy: { publishedAt: "desc" }, take: 12, select: { id: true, title: true, summary: true, slug: true, category: true } }),
    prisma.event.findMany({ where: { status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null }, startDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, take: 12, select: { id: true, title: true, location: true, slug: true } }),
    prisma.opportunity.findMany({ where: { status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: { not: null }, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] }, orderBy: { createdAt: "desc" }, take: 12, select: { id: true, title: true, location: true, type: true, slug: true, eligibilityCriteria: true } }),
    prisma.administrativeProcedure.findMany({ where: { moderationStatus: "APPROVED", publishedAt: { not: null } }, take: 10, select: { id: true, title: true, slug: true, category: true } }),
    prisma.scholarship.findMany({ where: { moderationStatus: "APPROVED", publishedAt: { not: null }, deadline: { gte: new Date() } }, orderBy: { deadline: "asc" }, take: 10, select: { id: true, title: true, country: true, applicationUrl: true, eligibilityCriteria: true } }),
  ]);
  const city = preferences.city?.name;
  const country = preferences.city?.country.name ?? preferences.country?.name;
  const interests = preferences.interests;
  const matches = (text: string) => interests.some((interest) => includes(text, interest));
  const nearby = (location: string) => includes(location, city) || includes(location, country);
  return { preferences, sections: {
    opportunities: opportunities.filter((item) => matches(`${item.title} ${item.eligibilityCriteria ?? ""}`) || nearby(item.location) || (preferences.memberStatus === "STUDENT" && item.type === "INTERNSHIP")).map((item) => ({ id: item.id, title: item.title, detail: item.location, href: `/opportunities/${item.slug}`, reason: nearby(item.location) ? "Pres de votre localisation" : "Correspond a votre profil" })),
    events: events.filter((item) => nearby(item.location) || matches(`${item.title} ${item.location}`)).map((item) => ({ id: item.id, title: item.title, detail: item.location, href: `/events/${item.slug}`, reason: "Evenement proche ou lie a vos interets" })),
    procedures: procedures.filter((item) => matches(`${item.title} ${item.category}`) || preferences.memberStatus === "STUDENT").map((item) => ({ id: item.id, title: item.title, detail: item.category, href: `/procedures/${item.slug}`, reason: "Guide utile pour votre profil" })),
    news: articles.filter((item) => matches(`${item.title} ${item.summary ?? ""}`) || (preferences.memberStatus === "STUDENT" && ["CAMPUS", "STUDENTS"].includes(item.category))).map((item) => ({ id: item.id, title: item.title, detail: item.summary ?? "Actualite GabonConnect", href: `/news/${item.slug}`, reason: "Correspond a vos interets" })),
    scholarships: scholarships.filter((item) => preferences.memberStatus === "STUDENT" || matches(`${item.title} ${item.country} ${item.eligibilityCriteria}`)).map((item) => ({ id: item.id, title: item.title, detail: item.country, href: item.applicationUrl, reason: "Bourse adaptee a votre profil" })),
  } };
});