import "dotenv/config";
import { MemberStatus } from "../app/generated/prisma";
import { answerFromRAG } from "../lib/ai/assistant";
import { getPersonalizedFeedForPreferences, type FeedItem, type FeedPreferences } from "../lib/personalized-feed";

type Scenario = { name: string; preferences: FeedPreferences; question: string; expectations: Array<{ label: string; pass: (items: FeedItem[]) => boolean }>; requiredSources: string[] };

function flatten(sections: Record<string, FeedItem[]>): FeedItem[] {
  return Object.values(sections).flat();
}

function includesTitle(items: FeedItem[], value: string): boolean {
  return items.some((item) => item.title.toLowerCase().includes(value.toLowerCase()));
}

const scenarios: Scenario[] = [
  {
    name: "Etudiant a Paris",
    preferences: { memberStatus: MemberStatus.STUDENT, cityName: "Paris", countryName: "France", interests: ["Bourses", "Campus", "Demarches"] },
    question: "Comment renouveler mon passeport et quelles sont les dates de bourse ?",
    expectations: [
      { label: "Bourse ANBG", pass: (items) => includesTitle(items, "ANBG") },
      { label: "passeport consulaire", pass: (items) => includesTitle(items, "Passeport") },
      { label: "evenement a Paris", pass: (items) => items.some((item) => item.detail.includes("Paris")) },
      { label: "exclusion des opportunites Libreville", pass: (items) => !items.some((item) => item.href.startsWith("/opportunities/") && item.detail.includes("Libreville")) },
    ],
    requiredSources: ["DGBC", "ANBG"],
  },
  {
    name: "Entrepreneur a Libreville",
    preferences: { memberStatus: MemberStatus.ENTREPRENEUR, cityName: "Libreville", countryName: "Gabon", interests: ["Opportunites", "Entreprise", "Actualites"] },
    question: "Quelles sont les etapes pour enregistrer une entreprise a Libreville ?",
    expectations: [
      { label: "guide ANPI", pass: (items) => includesTitle(items, "ANPI") },
      { label: "opportunite locale Libreville", pass: (items) => items.some((item) => item.href.startsWith("/opportunities/") && item.detail.includes("Libreville")) },
    ],
    requiredSources: ["ANPI"],
  },
  {
    name: "Diaspora professionnelle a Montreal",
    preferences: { memberStatus: MemberStatus.PROFESSIONAL, cityName: "Montreal", countryName: "Canada", interests: ["Consulat", "Diaspora", "Evenements"] },
    question: "Comment faire legaliser un document depuis le Canada ?",
    expectations: [
      { label: "retranscription d'etat civil", pass: (items) => includesTitle(items, "Acte de naissance") },
      { label: "evenement a Montreal", pass: (items) => items.some((item) => item.detail.includes("Montreal")) },
    ],
    requiredSources: ["Canada"],
  },
];

async function main() {
  let failed = false;
  for (const scenario of scenarios) {
    const sections = await getPersonalizedFeedForPreferences(scenario.preferences);
    const items = flatten(sections);
    const feed = scenario.expectations.map((expectation) => ({ label: expectation.label, passed: expectation.pass(items) }));
    const answer = await answerFromRAG(scenario.question, "fr");
    const sources = answer.sources.map((source) => source.sourceName ?? "");
    const assistant = scenario.requiredSources.map((source) => ({ source, passed: sources.some((name) => name.toLowerCase().includes(source.toLowerCase())) }));
    if ([...feed, ...assistant].some((result) => !result.passed)) failed = true;
    console.log(JSON.stringify({ scenario: scenario.name, feed, assistant, feedTitles: items.map((item) => item.title), sources, grounded: answer.grounded }, null, 2));
  }
  if (failed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });