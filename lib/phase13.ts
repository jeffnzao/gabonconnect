export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AnnouncementStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
export type ShopStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AnnouncementTargetType = "ASSOCIATION" | "CONTINENT" | "COUNTRY" | "CITY";

export interface AnnouncementTargetDraft {
  type: AnnouncementTargetType;
  value: string;
}

export function normalizeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isArticlePublic(status: ArticleStatus, publishedAt: Date | null, now = new Date()): boolean {
  return status === "PUBLISHED" && publishedAt !== null && publishedAt <= now;
}

export function isAnnouncementVisible(
  status: AnnouncementStatus,
  startsAt: Date | null,
  endsAt: Date | null,
  now = new Date(),
): boolean {
  return (
    status === "ACTIVE" &&
    (startsAt === null || startsAt <= now) &&
    (endsAt === null || endsAt >= now)
  );
}

export function isShopPublic(status: ShopStatus): boolean {
  return status === "PUBLISHED";
}

export function isProductPublic(status: ProductStatus): boolean {
  return status === "PUBLISHED";
}

export function validateAnnouncementTargets(targets: AnnouncementTargetDraft[]): AnnouncementTargetDraft[] {
  const seen = new Set<string>();
  return targets.map((target) => {
    const value = target.value.trim();
    const key = `${target.type}:${value}`;

    if (!value) {
      throw new Error("Announcement target values are required.");
    }
    if (seen.has(key)) {
      throw new Error("Duplicate announcement targets are not allowed.");
    }

    seen.add(key);
    return { type: target.type, value };
  });
}

export function canManageResource(ownerId: string, userId: string, role: string): boolean {
  return ownerId === userId || role === "ADMIN";
}