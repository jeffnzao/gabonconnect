// Tests "RAG Vector Store & Content Indexing Engine" (Task 061).
// Simulation en pur JS (repli local sans cle API) + inspection de source ; pas d'appel reseau/DB.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildEmbeddingText, chunkText, cosineSimilarity, EMBEDDING_DIMENSIONS, generateEmbedding } from "./vector-store";

const root = join(__dirname, "..", "..");
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

async function main() {
  // 1. Sans OPENAI_API_KEY, le repli local doit produire un vecteur normalise de la bonne dimension.
  delete process.env.OPENAI_API_KEY;
  const a = await generateEmbedding("Bourse d'excellence pour les etudiants gabonais a l'etranger");
  assert.equal(a.provider, "local-fallback");
  assert.equal(a.embedding.length, EMBEDDING_DIMENSIONS);
  const norm = Math.sqrt(a.embedding.reduce((sum, value) => sum + value * value, 0));
  assert.ok(Math.abs(norm - 1) < 1e-6 || norm === 0, "le vecteur de repli doit etre normalise (norme ~1)");

  // 2. Deux textes similaires doivent avoir un score cosinus plus eleve que deux textes sans rapport.
  const b = await generateEmbedding("Nouvelle bourse d'etudes destinee aux etudiants gabonais");
  const c = await generateEmbedding("Resultats du championnat local de football amateur");
  const similarScore = cosineSimilarity(a.embedding, b.embedding);
  const unrelatedScore = cosineSimilarity(a.embedding, c.embedding);
  assert.ok(similarScore > unrelatedScore, `similar (${similarScore}) doit depasser unrelated (${unrelatedScore})`);

  // 3. Le decoupage en chunks respecte la longueur maximale et ne perd pas de contenu significatif.
  const longText = Array.from({ length: 20 }, (_, i) => `Phrase numero ${i} sur les demarches administratives au Gabon.`).join(" ");
  const chunks = chunkText(longText, 100);
  assert.ok(chunks.length > 1, "un texte long doit produire plusieurs chunks");
  assert.ok(chunks.every((chunk) => chunk.length <= 120), "chaque chunk doit rester proche de la limite demandee");
  assert.deepEqual(chunkText(""), []);
  assert.deepEqual(chunkText("Texte court."), ["Texte court."]);

  // 4. Le texte a vectoriser combine bien titre + extrait + contenu.
  const embeddingText = buildEmbeddingText("Titre", "Extrait", "Contenu complet");
  assert.match(embeddingText, /Titre/);
  assert.match(embeddingText, /Extrait/);
  assert.match(embeddingText, /Contenu complet/);

  // 5. L'indexation ne doit jamais bloquer une requete utilisateur : appel en fire-and-forget dans moderateContent.
  const contentActionsSource = read("lib/actions/content.ts");
  assert.match(contentActionsSource, /void indexContentForRAG\(embeddingSourceType, id\)\.catch/);
  assert.match(contentActionsSource, /DOMAIN_TO_EMBEDDING_SOURCE_TYPE/);

  // 6. Le script de reindexation globale existe et est expose via npm run rag:reindex.
  const packageJson = JSON.parse(read("package.json")) as { scripts?: Record<string, string> };
  assert.equal(packageJson.scripts?.["rag:reindex"], "tsx scripts/reindex-rag.ts");

  console.log("All RAG vector store tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
