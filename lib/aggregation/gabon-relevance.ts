import type { SourceRegistryType } from "@/app/generated/prisma";
import { evaluateGabonRelevance } from "@/lib/relevance/gabon-relevance-engine";

// Institutions gabonaises officielles : validees d'office quel que soit le contenu.
const OFFICIAL_SOURCE_TYPES: SourceRegistryType[] = ["GOVERNMENT", "DIPLOMATIC"];

// Mots-cles et entites qui etablissent un lien direct ou indirect avec le Gabon/la diaspora.
const GABON_KEYWORDS = [
  "gabon",
  "gabonais",
  "gabonaise",
  "gabonaises",
  "libreville",
  "port-gentil",
  "port gentil",
  "franceville",
  "oyem",
  "lambarene",
  "moanda",
  "mouila",
  "tchibanga",
  "koulamoutou",
  "anbg",
  "dgbc",
  "ambassade du gabon",
  "ambassade",
  "consulat",
  "consulat general",
  "diaspora",
  "diaspora gabonaise",
  "etudiants gabonais",
  "communaute gabonaise",
  "gabonais de",
  "amicale gabonaise",
  "estuaire",
  "haut-ogooue",
  "moyen-ogooue",
  "ngounie",
  "nyanga",
  "ogooue-ivindo",
  "ogooue-lolo",
  "ogooue-maritime",
  "woleu-ntem",
] as const;

export interface GabonRelevanceInput {
  title: string;
  excerpt: string;
  content?: string;
  sourceType: SourceRegistryType;
  sourceName: string;
}

export type GabonRelevanceReason = "official_gabon_source" | "keyword_match" | "no_gabon_link";

export interface GabonRelevanceResult {
  score: number;
  isRelevant: boolean;
  matchedKeywords: string[];
  reason: GabonRelevanceReason;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Filtre "Ancrage Gabon" : toute source officielle gabonaise est validee d'office ;
 * toute autre source doit citer au moins un mot-cle/entite lie au Gabon ou a sa diaspora.
 */
export function computeGabonRelevance(input: GabonRelevanceInput): GabonRelevanceResult {
  const decision = evaluateGabonRelevance({
    contentId: "legacy-relevance-check",
    domain: "articles",
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    sourceType: input.sourceType,
    sourceName: input.sourceName,
  });
  const matchedKeywords = decision.score_breakdown.flatMap((entry) => entry.matchedTerms).filter((term) => !term.startsWith("sensitive:") && term !== "no_gabon_signal");
  return {
    score: Math.max(0, Math.min(1, decision.score / 100)),
    isRelevant: decision.routing.primary_target !== "QUARANTINE",
    matchedKeywords,
    reason: decision.routing.primary_target === "QUARANTINE" ? "no_gabon_link" : (OFFICIAL_SOURCE_TYPES.includes(input.sourceType) ? "official_gabon_source" : "keyword_match"),
  };
}
