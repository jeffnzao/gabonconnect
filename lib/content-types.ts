import type { ContentModerationStatus } from "@/app/generated/prisma";

export const contentDomains = ["articles", "events", "opportunities", "shops", "scholarships", "procedures", "associations"] as const;
export type ContentDomain = (typeof contentDomains)[number];
export type ContentAction = "approve" | "reject" | "publish" | "unpublish" | "archive";

export interface ContentItem {
  id: string;
  domain: ContentDomain;
  title: string;
  excerpt: string;
  businessStatus: string;
  moderationStatus: ContentModerationStatus;
  publishedAt: Date | null;
  archivedAt: Date | null;
  sourceName: string | null;
  canonicalUrl: string | null;
  copyrightFlag: boolean;
  createdAt: Date;
}
