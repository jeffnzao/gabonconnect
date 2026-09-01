// Tests "Ancred RAG AI Assistant" (Task 062).
// Simulation en pur JS (pas de OPENAI_API_KEY -> repli extractif) + inspection de source ; pas d'appel reseau/DB.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSystemPrompt, generateAssistantAnswer } from "./assistant";
import type { SimilarContentMatch } from "./vector-store";

const root = join(__dirname, "..", "..");
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

function match(overrides: Partial<SimilarContentMatch> = {}): SimilarContentMatch {
  return {
    sourceType: "SCHOLARSHIP" as SimilarContentMatch["sourceType"],
    sourceId: "scholarship-anbg-orientation-afrique",
    locale: "fr",
    chunkIndex: 0,
    content: "Orientation ANBG : priorite donnee aux ecoles et universites africaines.",
    score: 0.9,
    sourceName: "ANBG - Agence Nationale des Bourses du Gabon",
    canonicalUrl: null,
    ...overrides,
  };
}

async function main() {
  delete process.env.OPENAI_API_KEY;

  // 1. Le prompt systeme rappelle le role, les consignes d'ancrage strict et l'obligation de citation.
  const prompt = buildSystemPrompt([match()]);
  assert.match(prompt, /assistant officiel GabonConnect/i);
  assert.match(prompt, /EXCLUSIVEMENT sur le contexte/);
  assert.match(prompt, /cite la source originale/i);
  assert.match(prompt, /ne disposes pas de cette information/i);
  assert.match(prompt, /Source : ANBG - Agence Nationale des Bourses du Gabon/);

  // 2. Sans contexte pertinent (aucun match), l'assistant doit indiquer qu'il ne dispose pas de l'information (non ancre).
  const noContext = await generateAssistantAnswer("Question hors base", [], "fr");
  assert.equal(noContext.grounded, false);
  assert.equal(noContext.sources.length, 0);
  assert.match(noContext.answer, /ne dispose pas de cette information/i);

  // 3. Avec du contexte, la reponse est ancree et cite systematiquement la/les source(s).
  const grounded = await generateAssistantAnswer("Quelles sont les bourses ANBG pour l'Afrique ?", [match()], "fr");
  assert.equal(grounded.grounded, true);
  assert.equal(grounded.sources.length, 1);
  assert.equal(grounded.sources[0].attribution, "Source : ANBG - Agence Nationale des Bourses du Gabon");
  assert.match(grounded.answer, /Source : ANBG - Agence Nationale des Bourses du Gabon/);

  // 4. Plusieurs passages de sources differentes -> toutes les sources distinctes sont citees, sans doublon.
  const multiSource = await generateAssistantAnswer(
    "Bourses et demarches",
    [match(), match({ sourceId: "scholarship-campus-france", sourceName: "Campus France", canonicalUrl: "https://www.campusfrance.org/", content: "Bourse Campus France pour un projet d'etudes en France." })],
    "fr",
  );
  assert.equal(multiSource.sources.length, 2);
  assert.match(multiSource.answer, /Source : Campus France \(https:\/\/www\.campusfrance\.org\/\)/);

  // 5. Message "je ne sais pas" localise en anglais.
  const noContextEn = await generateAssistantAnswer("Unrelated question", [], "en");
  assert.match(noContextEn.answer, /do not have this information/i);

  // 6. L'endpoint API recupere le contexte via searchSimilarContent et delegue la generation a answerFromRAG (ancrage garanti).
  const routeSource = read("app/api/ai/chat/route.ts");
  assert.match(routeSource, /answerFromRAG\(prompt, locale\)/);

  // 7. Le widget UI est bien monte globalement sans remplacer le layout existant (Header/Footer/FeedbackBanner conserves).
  const layoutSource = read("app/layout.tsx");
  assert.match(layoutSource, /<AssistantChat locale=\{locale\} \/>/);
  assert.match(layoutSource, /<FeedbackBanner locale=\{locale\} \/>/);
  assert.match(layoutSource, /<Header locale=\{locale\} \/>/);

  // 8. Le composant propose bien les 3 suggestions rapides et affiche les sources citees.
  const componentSource = read("components/ai/assistant-chat.tsx");
  assert.match(componentSource, /messages\.assistant\.suggestion1/);
  assert.match(componentSource, /messages\.assistant\.suggestion2/);
  assert.match(componentSource, /messages\.assistant\.suggestion3/);
  assert.match(componentSource, /SourceBadge/);

  console.log("All RAG assistant tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
