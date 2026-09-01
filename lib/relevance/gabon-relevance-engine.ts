import { OFFICIAL_SOURCE_TYPES, BILATERAL_RELATION_TERMS, DIASPORA_TERMS, ELIGIBLE_OPPORTUNITY_TERMS, GABON_DIRECT_TERMS, GABON_NATIONAL_TERMS, RELEVANCE_WEIGHTS, SENSITIVE_TERMS, SPAM_TERMS } from "./taxonomy";
import type { GabonRelevanceDecision, GabonRelevanceInput, RelevanceContentDomain, RelevanceLevel, RelevancePrimaryTarget, ScoreBreakdownEntry } from "./types";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchedTerms(text: string, terms: readonly string[]): string[] {
  return terms.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`).test(text);
  });
}

function addScore(breakdown: ScoreBreakdownEntry[], signal: ScoreBreakdownEntry["signal"], points: number, terms: string[]) {
  if (terms.length > 0) breakdown.push({ signal, points, matchedTerms: terms });
}

function determineLevel(signals: Set<ScoreBreakdownEntry["signal"]>): RelevanceLevel {
  if (signals.has("gabon_direct") || signals.has("official_source")) return "L1_GABON_DIRECT";
  if (signals.has("diaspora") || signals.has("gabon_nationals")) return "L2_DIASPORA_GABONAISE";
  if (signals.has("bilateral_relation")) return "L3_RELATIONS_INTERNATIONALES";
  if (signals.has("eligible_opportunity")) return "L4_CAMPUS_OPPORTUNITIES";
  return "L5_HORS_PERIMETRE";
}

function secondaryTargets(domain: RelevanceContentDomain, level: RelevanceLevel): RelevanceContentDomain[] {
  const targets = new Set<RelevanceContentDomain>([domain]);
  if (level === "L4_CAMPUS_OPPORTUNITIES") {
    targets.add("opportunities");
    targets.add("scholarships");
  }
  if (level === "L2_DIASPORA_GABONAISE") targets.add("events");
  if (level === "L3_RELATIONS_INTERNATIONALES") targets.add("articles");
  return [...targets];
}

function route(score: number, requiresSensitiveReview: boolean): RelevancePrimaryTarget {
  if (requiresSensitiveReview) return "HUMAN_REVIEW";
  if (score >= 70) return "AUTO_PUBLISH";
  if (score >= 40) return "HUMAN_REVIEW";
  return "QUARANTINE";
}

export function evaluateGabonRelevance(input: GabonRelevanceInput): GabonRelevanceDecision {
  const text = normalize(`${input.title} ${input.excerpt} ${input.content ?? ""} ${input.sourceName}`);
  const breakdown: ScoreBreakdownEntry[] = [];
  const directTerms = matchedTerms(text, GABON_DIRECT_TERMS);
  const nationalTerms = matchedTerms(text, GABON_NATIONAL_TERMS);
  const diasporaTerms = matchedTerms(text, DIASPORA_TERMS);
  const opportunityTerms = matchedTerms(text, ELIGIBLE_OPPORTUNITY_TERMS);
  const bilateralTerms = matchedTerms(text, BILATERAL_RELATION_TERMS);
  const sensitiveTerms = matchedTerms(text, SENSITIVE_TERMS);
  const spamTerms = matchedTerms(text, SPAM_TERMS);
  const isOfficialSource = (OFFICIAL_SOURCE_TYPES as readonly string[]).includes(input.sourceType);

  addScore(breakdown, "gabon_direct", RELEVANCE_WEIGHTS.gabon_direct, directTerms);
  addScore(breakdown, "gabon_nationals", RELEVANCE_WEIGHTS.gabon_nationals, nationalTerms);
  addScore(breakdown, "diaspora", RELEVANCE_WEIGHTS.diaspora, diasporaTerms);
  if (isOfficialSource) addScore(breakdown, "official_source", RELEVANCE_WEIGHTS.official_source, [input.sourceType]);

  const isEligibleOpportunity = opportunityTerms.length > 0 && (directTerms.length > 0 || nationalTerms.length > 0 || diasporaTerms.length > 0 || bilateralTerms.length > 0);
  if (isEligibleOpportunity) addScore(breakdown, "eligible_opportunity", RELEVANCE_WEIGHTS.eligible_opportunity, opportunityTerms);
  if (bilateralTerms.length > 0 && (directTerms.length > 0 || nationalTerms.length > 0 || diasporaTerms.length > 0 || isOfficialSource)) addScore(breakdown, "bilateral_relation", RELEVANCE_WEIGHTS.bilateral_relation, bilateralTerms);

  const hasPositiveSignal = breakdown.some((entry) => entry.points > 0);
  if (!hasPositiveSignal) addScore(breakdown, "unrelated", RELEVANCE_WEIGHTS.unrelated, ["no_gabon_signal"]);
  if (spamTerms.length > 0) addScore(breakdown, "spam_off_topic", RELEVANCE_WEIGHTS.spam_off_topic, spamTerms);

  const score = breakdown.reduce((total, entry) => total + entry.points, 0);
  const signals = new Set(breakdown.map((entry) => entry.signal));
  const level = determineLevel(signals);
  const isSensitive = sensitiveTerms.length > 0;
  const requiresSensitiveReview = isSensitive && hasPositiveSignal;
  const primaryTarget = route(score, requiresSensitiveReview);
  const tags = [...new Set([...breakdown.flatMap((entry) => entry.matchedTerms), ...sensitiveTerms.map((term) => `sensitive:${term}`)])];

  return {
    content_id: input.contentId,
    score,
    level,
    flags: { is_sensitive: isSensitive, requires_human_review: requiresSensitiveReview || primaryTarget === "HUMAN_REVIEW" },
    score_breakdown: breakdown,
    routing: { primary_target: primaryTarget, secondary_targets: secondaryTargets(input.domain, level), tags },
  };
}
