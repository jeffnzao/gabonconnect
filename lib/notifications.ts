// Moteur de notifications ciblees (Task 060) : declenche a l'approbation/publication
// d'un contenu News/Event/Opportunity, filtre les destinataires via UserPreferences
// (statut, ville/pays, centres d'interet) et attribue toujours la source d'origine.
// Module server-only (Prisma) : ne pas importer depuis un composant client.

import type { MemberStatus } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createNotificationForUser } from "@/lib/services/notification-service";

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return await prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

// Pour diffuser à TOUS les utilisateurs lors d'une nouvelle publication
export async function notifyAllUsersAboutPublication(pubTitle: string, pubLink: string, authorId: string) {
  const users = await prisma.user.findMany({
    where: { id: { not: authorId } }, // Exclure l'auteur
    select: { id: true },
  });

  const notifications = users.map((u) => ({
    userId: u.id,
    type: NotificationType.NEW_PUBLICATION,
    title: "Nouvelle publication",
    message: `Un nouveau contenu a été publié : "${pubTitle}"`,
    link: pubLink,
  }));

  await prisma.notification.createMany({ data: notifications });
}

export type NotifiableContentType = "articles" | "events" | "opportunities";

export interface ContentTargeting {
  title: string;
  excerpt: string;
  sourceName: string | null;
  canonicalUrl: string | null;
  /** null = pas de restriction de statut (visible pour tous les statuts). */
  statuses: MemberStatus[] | null;
  /** null = pas de contrainte geographique connue sur le contenu. */
  locationHint: string | null;
}

export interface PreferenceCandidate {
  userId: string;
  memberStatus: MemberStatus;
  interests: string[];
  cityName: string | null;
  countryName: string | null;
}

const GENERIC_LOCATIONS = new Set(["see official announcement", "remote", "online", "a definir", ""]);

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function textIncludes(haystack: string, needle: string): boolean {
  const trimmed = needle.trim();
  if (!trimmed) return false;
  return normalizeText(haystack).includes(normalizeText(trimmed));
}

/** Attribution obligatoire de la source dans chaque notification de contenu agrege. */
export function buildSourceAttribution(sourceName: string | null, canonicalUrl: string | null): string {
  if (sourceName && canonicalUrl) return `Source : ${sourceName} (${canonicalUrl})`;
  if (sourceName) return `Source : ${sourceName}`;
  if (canonicalUrl) return `Source : ${canonicalUrl}`;
  return "Source : GabonConnect";
}

export function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

export function buildNotificationMessage(excerpt: string, sourceName: string | null, canonicalUrl: string | null): string {
  return `${truncate(excerpt.trim(), 200)}\n${buildSourceAttribution(sourceName, canonicalUrl)}`;
}

export function normalizeLocationHint(location: string | null | undefined): string | null {
  if (!location) return null;
  const trimmed = location.trim();
  return GENERIC_LOCATIONS.has(trimmed.toLowerCase()) ? null : trimmed;
}

export function deriveArticleTargeting(category: string): MemberStatus[] | null {
  if (category === "CAMPUS" || category === "STUDENTS") return ["STUDENT"];
  if (category === "OPPORTUNITIES") return ["STUDENT", "PROFESSIONAL"];
  return null;
}

export function deriveOpportunityTargeting(type: string): MemberStatus[] | null {
  if (type === "INTERNSHIP") return ["STUDENT"];
  if (type === "JOB" || type === "PROJECT_CALL") return ["PROFESSIONAL"];
  return null;
}

function matchesStatus(statuses: MemberStatus[] | null, memberStatus: MemberStatus): boolean {
  return !statuses || statuses.includes(memberStatus);
}

function matchesLocation(locationHint: string | null, cityName: string | null, countryName: string | null): boolean {
  if (!locationHint) return true;
  if (cityName && textIncludes(locationHint, cityName)) return true;
  if (countryName && textIncludes(locationHint, countryName)) return true;
  return false;
}

function matchesInterests(interests: string[], text: string): boolean {
  return interests.some((interest) => textIncludes(text, interest));
}

/**
 * Regle de ciblage : un utilisateur est notifie si un de ses centres d'interet
 * mentionne le contenu, ou si son statut et sa localisation correspondent aux
 * cibles derivees du contenu (statut null / localisation absente = pas de restriction).
 */
export function isPreferenceTargeted(content: ContentTargeting, candidate: PreferenceCandidate): boolean {
  const contentText = `${content.title} ${content.excerpt}`;
  if (matchesInterests(candidate.interests, contentText)) return true;
  return matchesStatus(content.statuses, candidate.memberStatus) && matchesLocation(content.locationHint, candidate.cityName, candidate.countryName);
}

interface LoadedContent extends ContentTargeting {
  notificationType: "NEWS" | "EVENT" | "OPPORTUNITY";
  link: string;
}

async function loadContentForNotification(contentId: string, contentType: NotifiableContentType): Promise<LoadedContent | null> {
  if (contentType === "articles") {
    const article = await prisma.article.findUnique({
      where: { id: contentId },
      select: { title: true, summary: true, content: true, category: true, sourceName: true, canonicalUrl: true, moderationStatus: true, publishedAt: true, slug: true },
    });
    if (!article || article.moderationStatus !== "APPROVED" || !article.publishedAt) return null;
    return {
      title: article.title,
      excerpt: article.summary ?? article.content,
      sourceName: article.sourceName,
      canonicalUrl: article.canonicalUrl,
      statuses: deriveArticleTargeting(article.category),
      locationHint: null,
      notificationType: "NEWS",
      link: `/news/${article.slug}`,
    };
  }

  if (contentType === "events") {
    const event = await prisma.event.findUnique({
      where: { id: contentId },
      select: { title: true, description: true, sourceName: true, canonicalUrl: true, moderationStatus: true, publishedAt: true, location: true, slug: true },
    });
    if (!event || event.moderationStatus !== "APPROVED" || !event.publishedAt) return null;
    return {
      title: event.title,
      excerpt: event.description,
      sourceName: event.sourceName,
      canonicalUrl: event.canonicalUrl,
      statuses: null,
      locationHint: normalizeLocationHint(event.location),
      notificationType: "EVENT",
      link: `/events/${event.slug}`,
    };
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: contentId },
    select: { title: true, description: true, sourceName: true, canonicalUrl: true, moderationStatus: true, publishedAt: true, location: true, type: true, slug: true },
  });
  if (!opportunity || opportunity.moderationStatus !== "APPROVED" || !opportunity.publishedAt) return null;
  return {
    title: opportunity.title,
    excerpt: opportunity.description,
    sourceName: opportunity.sourceName,
    canonicalUrl: opportunity.canonicalUrl,
    statuses: deriveOpportunityTargeting(opportunity.type),
    locationHint: normalizeLocationHint(opportunity.location),
    notificationType: "OPPORTUNITY",
    link: `/opportunities/${opportunity.slug}`,
  };
}

export interface DispatchResult {
  notified: number;
  skipped: number;
}

/**
 * Notifie les utilisateurs dont les UserPreferences correspondent a un contenu
 * News/Event/Opportunity fraichement approuve et publie. Ne fait rien si le
 * contenu n'est pas (ou plus) APPROVED + publie.
 */
export async function dispatchContentNotifications(contentId: string, contentType: NotifiableContentType): Promise<DispatchResult> {
  const content = await loadContentForNotification(contentId, contentType);
  if (!content) return { notified: 0, skipped: 0 };

  const message = buildNotificationMessage(content.excerpt, content.sourceName, content.canonicalUrl);

  const candidates = await prisma.userPreferences.findMany({
    where: { preferredChannels: { hasSome: ["IN_APP", "EMAIL"] } },
    select: {
      userId: true,
      memberStatus: true,
      interests: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
    },
  });

  let notified = 0;
  let skipped = 0;
  for (const candidate of candidates) {
    const targeted = isPreferenceTargeted(content, {
      userId: candidate.userId,
      memberStatus: candidate.memberStatus,
      interests: candidate.interests,
      cityName: candidate.city?.name ?? null,
      countryName: candidate.country?.name ?? null,
    });
    if (!targeted) {
      skipped += 1;
      continue;
    }
    const notification = await createNotificationForUser(candidate.userId, {
      type: content.notificationType,
      title: content.title,
      message,
      link: content.link,
    });
    if (notification) notified += 1;
    else skipped += 1;
  }

  return { notified, skipped };
}
