import type { SourceRegistryType } from "@/app/generated/prisma";

export type RelevanceLevel = "L1_GABON_DIRECT" | "L2_DIASPORA_GABONAISE" | "L3_RELATIONS_INTERNATIONALES" | "L4_CAMPUS_OPPORTUNITIES" | "L5_HORS_PERIMETRE";
export type RelevancePrimaryTarget = "AUTO_PUBLISH" | "HUMAN_REVIEW" | "QUARANTINE";
export type RelevanceContentDomain = "articles" | "events" | "opportunities" | "scholarships" | "procedures";

export interface GabonRelevanceInput {
  contentId: string;
  domain: RelevanceContentDomain;
  title: string;
  excerpt: string;
  content?: string;
  sourceType: SourceRegistryType;
  sourceName: string;
  canonicalUrl?: string | null;
}

export interface ScoreBreakdownEntry {
  signal: "gabon_direct" | "gabon_nationals" | "diaspora" | "official_source" | "eligible_opportunity" | "bilateral_relation" | "unrelated" | "spam_off_topic";
  points: number;
  matchedTerms: string[];
}

export interface RelevanceFlags {
  is_sensitive: boolean;
  requires_human_review: boolean;
}

export interface RelevanceRouting {
  primary_target: RelevancePrimaryTarget;
  secondary_targets: RelevanceContentDomain[];
  tags: string[];
}

export interface GabonRelevanceDecision {
  content_id: string;
  score: number;
  level: RelevanceLevel;
  flags: RelevanceFlags;
  score_breakdown: ScoreBreakdownEntry[];
  routing: RelevanceRouting;
}
