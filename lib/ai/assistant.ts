// Assistant IA GabonConnect (Task 062) : orchestration RAG ancree au-dessus de
// searchSimilarContent (Task 061). Aucune reponse n'est generee sans contexte
// recupere depuis ContentEmbedding, et chaque source est systematiquement citee.

import { getMessages, type Locale } from "@/lib/i18n-config";
import { buildSourceAttribution } from "@/lib/notifications";
import { EmbeddingSourceType } from "@/app/generated/prisma";
import { searchSimilarContent, type SimilarContentMatch } from "@/lib/ai/vector-store";

const CHAT_MODEL = process.env.RAG_CHAT_MODEL ?? "gpt-4o-mini";
const MAX_CONTEXT_MATCHES = 5;
const UNIFIED_ASSISTANT_SOURCE_TYPES = [EmbeddingSourceType.ARTICLE, EmbeddingSourceType.EVENT, EmbeddingSourceType.OPPORTUNITY, EmbeddingSourceType.ADMINISTRATIVE_PROCEDURE, EmbeddingSourceType.SCHOLARSHIP, EmbeddingSourceType.HISTORICAL_EVENT, EmbeddingSourceType.HISTORICAL_FIGURE, EmbeddingSourceType.HISTORICAL_ARCHIVE, EmbeddingSourceType.DIASPORA_IMPACT];

export interface AssistantSource {
  sourceName: string | null;
  canonicalUrl: string | null;
  attribution: string;
}

export interface AssistantAnswer {
  answer: string;
  sources: AssistantSource[];
  /** false si aucun contexte pertinent n'a ete trouve (reponse "je ne sais pas"). */
  grounded: boolean;
}

/** Construit le prompt systeme : role, consignes d'ancrage strict, contexte numerote et source. */
export function buildSystemPrompt(matches: SimilarContentMatch[]): string {
  const context = matches.length
    ? matches
        .map((match, index) => `[${index + 1}] (${buildSourceAttribution(match.sourceName, match.canonicalUrl)})\n${match.content}`)
        .join("\n\n")
    : "Aucun contexte disponible.";

  return [
    "Tu es l'assistant officiel GabonConnect.",
    "Consignes : reponds de maniere precise, polie et concise, en t'appuyant EXCLUSIVEMENT sur le contexte fourni ci-dessous, extrait de la base GabonConnect (demarches administratives, bourses, actualites, evenements, opportunites, corpus historique et parcours de diaspora).",
    "Contraintes : cite la source originale de chaque fait mentionne (nom et lien canonique si disponible). Ne fabrique jamais d'information absente du contexte. Si le contexte ne permet pas de repondre a la question, indique explicitement que tu ne disposes pas de cette information.",
    "",
    "Contexte :",
    context,
  ].join("\n");
}

function dedupeSources(matches: SimilarContentMatch[]): AssistantSource[] {
  const seen = new Map<string, AssistantSource>();
  for (const match of matches) {
    const key = `${match.sourceName ?? ""}|${match.canonicalUrl ?? ""}`;
    if (seen.has(key)) continue;
    seen.set(key, { sourceName: match.sourceName, canonicalUrl: match.canonicalUrl, attribution: buildSourceAttribution(match.sourceName, match.canonicalUrl) });
  }
  return [...seen.values()];
}

function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

/** Repli sans LLM (pas de OPENAI_API_KEY) : reponse extractive assemblee depuis les passages les plus pertinents. */
function generateExtractiveAnswer(matches: SimilarContentMatch[]): string {
  return matches
    .slice(0, 3)
    .map((match) => `- ${truncate(match.content, 400)}`)
    .join("\n");
}

async function generateWithOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI chat completion failed: HTTP ${response.status}`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI chat completion response is missing content.");
  return content;
}

/** Ajoute en fin de reponse les citations que le modele n'aurait pas reprises telles quelles. */
function appendMissingCitations(answer: string, sources: AssistantSource[]): string {
  const missing = sources.filter((source) => !answer.includes(source.attribution));
  if (missing.length === 0) return answer;
  return `${answer}\n\n${missing.map((source) => source.attribution).join("\n")}`;
}

export async function generateAssistantAnswer(prompt: string, matches: SimilarContentMatch[], locale: Locale = "fr"): Promise<AssistantAnswer> {
  const messages = getMessages(locale);
  if (matches.length === 0) {
    return { answer: messages.assistant.noData, sources: [], grounded: false };
  }

  const systemPrompt = buildSystemPrompt(matches);
  let answer: string;
  try {
    answer = process.env.OPENAI_API_KEY ? await generateWithOpenAI(prompt, systemPrompt) : generateExtractiveAnswer(matches);
  } catch (error) {
    console.error("[assistant] generation failed, falling back to extractive answer:", error);
    answer = generateExtractiveAnswer(matches);
  }

  const sources = dedupeSources(matches);
  return { answer: appendMissingCitations(answer, sources), sources, grounded: true };
}

/** Point d'entree du pipeline RAG complet : recherche vectorielle puis generation ancree. */
export async function answerFromRAG(prompt: string, locale: Locale = "fr"): Promise<AssistantAnswer> {
  const trimmed = prompt.trim();
  if (!trimmed) return { answer: getMessages(locale).assistant.noData, sources: [], grounded: false };
  const matches = await searchSimilarContent(trimmed, MAX_CONTEXT_MATCHES, { sourceTypes: UNIFIED_ASSISTANT_SOURCE_TYPES });
  return generateAssistantAnswer(trimmed, matches, locale);
}
