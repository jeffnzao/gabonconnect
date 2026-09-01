// RAG Vector Store (Task 061) : indexation vectorielle des contenus approuves
// (Article, AdministrativeProcedure, Scholarship, Event, Opportunity) et recherche
// par similarite cosinus. Module server-only (Prisma + appel reseau optionnel).
//
// Fournisseur : OpenAI `text-embedding-3-small` (1536 dimensions) si OPENAI_API_KEY
// est defini. Sinon, repli local deterministe (bag-of-words hashe, meme dimension)
// pour permettre le developpement/test sans cle API ni appel reseau.

import { EmbeddingSourceType, type Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export const EMBEDDING_DIMENSIONS = 1536;
export const EMBEDDING_MODEL = process.env.RAG_EMBEDDING_MODEL ?? "text-embedding-3-small";
export const EMBEDDING_PROVIDER = process.env.OPENAI_API_KEY ? "openai" : "local-fallback";
const LOCAL_FALLBACK_MODEL = "hashing-bow-v1";
const CHUNK_MAX_LENGTH = 800;
const MAX_CANDIDATES_SCANNED = 1000;

export interface EmbeddingResult {
  embedding: number[];
  provider: string;
  model: string;
}

function hashToken(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 31 + token.charCodeAt(i)) | 0;
  }
  return hash;
}

/** Repli local sans dependance externe : vecteur bag-of-words hashe, normalise en norme L2. */
function generateLocalFallbackEmbedding(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);

  for (const token of tokens) {
    const hash = hashToken(token);
    const index = Math.abs(hash) % EMBEDDING_DIMENSIONS;
    const sign = hash % 2 === 0 ? 1 : -1;
    vector[index] += sign;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!response.ok) throw new Error(`OpenAI embeddings request failed: HTTP ${response.status}`);
  const payload = (await response.json()) as { data?: Array<{ embedding: number[] }> };
  const embedding = payload.data?.[0]?.embedding;
  if (!embedding) throw new Error("OpenAI embeddings response is missing the embedding vector.");
  return embedding;
}

export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  if (process.env.OPENAI_API_KEY) {
    return { embedding: await generateOpenAIEmbedding(text), provider: "openai", model: EMBEDDING_MODEL };
  }
  return { embedding: generateLocalFallbackEmbedding(text), provider: "local-fallback", model: LOCAL_FALLBACK_MODEL };
}

/** Decoupe un texte long en segments d'au plus `maxLength` caracteres, sur des frontieres de phrase. */
export function chunkText(text: string, maxLength: number = CHUNK_MAX_LENGTH): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const sentences = normalized.match(/[^.!?]+[.!?]*/g) ?? [normalized];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence.trim()}` : sentence.trim();
    if (candidate.length > maxLength && current) {
      chunks.push(current.trim());
      current = sentence.trim();
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export function buildEmbeddingText(title: string, excerpt: string, content?: string): string {
  return [title, excerpt, content].filter(Boolean).join("\n\n");
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function tokenSet(value: string): Set<string> {
  return new Set(
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2),
  );
}

/** Maintient la precision du repli local lorsque les termes de la question existent textuellement dans un passage. */
export function lexicalOverlapScore(query: string, content: string): number {
  const queryTokens = tokenSet(query);
  if (queryTokens.size === 0) return 0;
  const contentTokens = tokenSet(content);
  let matches = 0;
  for (const token of queryTokens) {
    if (contentTokens.has(token)) matches += 1;
  }
  return matches / queryTokens.size;
}

interface IndexableContent {
  title: string;
  excerpt: string;
  content?: string;
  sourceName: string | null;
  canonicalUrl: string | null;
  isApproved: boolean;
  locale: string;
}

async function loadIndexableContent(sourceType: EmbeddingSourceType, sourceId: string): Promise<IndexableContent | null> {
  if (sourceType === EmbeddingSourceType.ARTICLE) {
    const row = await prisma.article.findUnique({ where: { id: sourceId }, select: { title: true, summary: true, content: true, sourceName: true, canonicalUrl: true, status: true, moderationStatus: true, publishedAt: true } });
    if (!row) return null;
    return { title: row.title, excerpt: row.summary ?? "", content: row.content, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, locale: "fr", isApproved: row.status === "PUBLISHED" && row.moderationStatus === "APPROVED" && row.publishedAt !== null };
  }
  if (sourceType === EmbeddingSourceType.EVENT) {
    const row = await prisma.event.findUnique({ where: { id: sourceId }, select: { title: true, description: true, sourceName: true, canonicalUrl: true, status: true, moderationStatus: true, publishedAt: true } });
    if (!row) return null;
    return { title: row.title, excerpt: row.description, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, locale: "fr", isApproved: row.status === "PUBLISHED" && row.moderationStatus === "APPROVED" && row.publishedAt !== null };
  }
  if (sourceType === EmbeddingSourceType.OPPORTUNITY) {
    const row = await prisma.opportunity.findUnique({ where: { id: sourceId }, select: { title: true, description: true, sourceName: true, canonicalUrl: true, status: true, moderationStatus: true, publishedAt: true } });
    if (!row) return null;
    return { title: row.title, excerpt: row.description, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, locale: "fr", isApproved: row.status === "PUBLISHED" && row.moderationStatus === "APPROVED" && row.publishedAt !== null };
  }
  if (sourceType === EmbeddingSourceType.SCHOLARSHIP) {
    const row = await prisma.scholarship.findUnique({ where: { id: sourceId }, select: { title: true, description: true, sourceName: true, canonicalUrl: true, moderationStatus: true, publishedAt: true } });
    if (!row) return null;
    return { title: row.title, excerpt: row.description, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, locale: "fr", isApproved: row.moderationStatus === "APPROVED" && row.publishedAt !== null };
  }
  if (sourceType === EmbeddingSourceType.ADMINISTRATIVE_PROCEDURE) {
    const row = await prisma.administrativeProcedure.findUnique({ where: { id: sourceId }, select: { title: true, description: true, sourceName: true, canonicalUrl: true, moderationStatus: true, publishedAt: true } });
    if (!row) return null;
    return { title: row.title, excerpt: row.description, sourceName: row.sourceName, canonicalUrl: row.canonicalUrl, locale: "fr", isApproved: row.moderationStatus === "APPROVED" && row.publishedAt !== null };
  }
  if (sourceType === EmbeddingSourceType.HISTORICAL_EVENT) {
    const row = await prisma.historicalEvent.findUnique({ where: { id: sourceId }, select: { title: true, period: true, description: true, sourceLevel: true, relevanceDecision: true } });
    if (!row) return null;
    return { title: row.title, excerpt: row.period, content: row.description, sourceName: `Niveau de source ${row.sourceLevel}`, canonicalUrl: null, locale: "fr", isApproved: row.relevanceDecision !== null };
  }
  if (sourceType === EmbeddingSourceType.HISTORICAL_FIGURE) {
    const row = await prisma.historicalFigure.findUnique({ where: { id: sourceId }, select: { fullName: true, category: true, biography: true, mainImpact: true, sourceLevel: true, relevanceDecision: true } });
    if (!row) return null;
    return { title: row.fullName, excerpt: row.category, content: `${row.biography}\n\n${row.mainImpact}`, sourceName: `Niveau de source ${row.sourceLevel}`, canonicalUrl: null, locale: "fr", isApproved: row.relevanceDecision !== null };
  }
  if (sourceType === EmbeddingSourceType.HISTORICAL_ARCHIVE) {
    const row = await prisma.historicalArchive.findUnique({ where: { id: sourceId }, select: { title: true, legalNature: true, sourceLevel: true, documentUrl: true, relevanceDecision: true } });
    if (!row) return null;
    return { title: row.title, excerpt: row.legalNature, sourceName: `Niveau de source ${row.sourceLevel}`, canonicalUrl: row.documentUrl, locale: "fr", isApproved: row.relevanceDecision !== null };
  }
  if (sourceType === EmbeddingSourceType.DIASPORA_IMPACT) {
    const row = await prisma.diasporaImpact.findUnique({ where: { id: sourceId }, select: { country: true, city: true, period: true, domain: true, contribution: true, sourceLevel: true, relevanceDecision: true, figure: { select: { fullName: true } } } });
    if (!row) return null;
    return { title: row.figure?.fullName ?? `Parcours diaspora - ${row.country}`, excerpt: `${row.domain}, ${row.city ?? row.country}, ${row.period}`, content: row.contribution, sourceName: `Niveau de source ${row.sourceLevel}`, canonicalUrl: null, locale: "fr", isApproved: row.relevanceDecision !== null };
  }
  return null;
}

export interface IndexContentResult {
  chunksIndexed: number;
  purged: boolean;
}

/**
 * Indexe (ou purge) les embeddings d'un contenu. Ne fait rien de bloquant pour
 * l'utilisateur : cette fonction doit etre appelee en fire-and-forget depuis les
 * workflows de moderation/publication (voir lib/actions/content.ts).
 */
export async function indexContentForRAG(sourceType: EmbeddingSourceType, sourceId: string): Promise<IndexContentResult> {
  const content = await loadIndexableContent(sourceType, sourceId);

  // Contenu absent ou non approuve/publie : purge des embeddings existants (depublication).
  if (!content || !content.isApproved) {
    const { count } = await prisma.contentEmbedding.deleteMany({ where: { sourceType, sourceId } });
    return { chunksIndexed: 0, purged: count > 0 };
  }

  const chunks = chunkText(buildEmbeddingText(content.title, content.excerpt, content.content));
  const results = await Promise.all(chunks.map((chunk) => generateEmbedding(chunk)));

  await prisma.$transaction([
    prisma.contentEmbedding.deleteMany({ where: { sourceType, sourceId, chunkIndex: { gte: chunks.length } } }),
    ...results.map((result, chunkIndex) =>
      prisma.contentEmbedding.upsert({
        where: { sourceType_sourceId_locale_chunkIndex: { sourceType, sourceId, locale: content.locale, chunkIndex } },
        create: { sourceType, sourceId, locale: content.locale, chunkIndex, content: chunks[chunkIndex], embedding: result.embedding, provider: result.provider, model: result.model },
        update: { content: chunks[chunkIndex], embedding: result.embedding, provider: result.provider, model: result.model },
      }),
    ),
  ]);

  return { chunksIndexed: chunks.length, purged: false };
}

export interface SimilarContentMatch {
  sourceType: EmbeddingSourceType;
  sourceId: string;
  locale: string;
  chunkIndex: number;
  content: string;
  score: number;
  sourceName: string | null;
  canonicalUrl: string | null;
}

export interface SearchSimilarContentFilters {
  sourceTypes?: EmbeddingSourceType[];
  locale?: string;
}

const HISTORICAL_EMBEDDING_TYPES = [
  EmbeddingSourceType.HISTORICAL_EVENT,
  EmbeddingSourceType.HISTORICAL_FIGURE,
  EmbeddingSourceType.HISTORICAL_ARCHIVE,
  EmbeddingSourceType.DIASPORA_IMPACT,
];

/** Recherche RAG restreinte au corpus historique et aux parcours de diaspora. */
export async function searchHistoricalContent(query: string, limit = 5): Promise<SimilarContentMatch[]> {
  return searchSimilarContent(query, limit, { sourceTypes: HISTORICAL_EMBEDDING_TYPES });
}

/**
 * Recherche par similarite cosinus dans `ContentEmbedding`. Le vecteur est stocke
 * en Float[] (pas encore pgvector natif) : la similarite est donc calculee cote
 * application sur un echantillon borne (MAX_CANDIDATES_SCANNED) plutot qu'en SQL.
 */
export async function searchSimilarContent(query: string, limit = 5, filters?: SearchSimilarContentFilters): Promise<SimilarContentMatch[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const { embedding: queryEmbedding } = await generateEmbedding(trimmedQuery);

  const where: Prisma.ContentEmbeddingWhereInput = {
    ...(filters?.sourceTypes?.length ? { sourceType: { in: filters.sourceTypes } } : {}),
    ...(filters?.locale ? { locale: filters.locale } : {}),
  };

  const candidates = await prisma.contentEmbedding.findMany({
    where,
    take: MAX_CANDIDATES_SCANNED,
    orderBy: { updatedAt: "desc" },
    select: { sourceType: true, sourceId: true, locale: true, chunkIndex: true, content: true, embedding: true },
  });

  const scored = candidates
    .map((candidate) => {
      const cosineScore = cosineSimilarity(queryEmbedding, candidate.embedding);
      const lexicalScore = lexicalOverlapScore(trimmedQuery, candidate.content);
      return { ...candidate, score: cosineScore + lexicalScore * 0.5 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit));

  const metadataBySource = new Map<string, { sourceName: string | null; canonicalUrl: string | null }>();
  for (const candidate of scored) {
    const key = `${candidate.sourceType}:${candidate.sourceId}`;
    if (metadataBySource.has(key)) continue;
    const source = await loadIndexableContent(candidate.sourceType, candidate.sourceId);
    metadataBySource.set(key, { sourceName: source?.sourceName ?? null, canonicalUrl: source?.canonicalUrl ?? null });
  }

  return scored.map((candidate) => ({
    sourceType: candidate.sourceType,
    sourceId: candidate.sourceId,
    locale: candidate.locale,
    chunkIndex: candidate.chunkIndex,
    content: candidate.content,
    score: candidate.score,
    ...metadataBySource.get(`${candidate.sourceType}:${candidate.sourceId}`)!,
  }));
}
