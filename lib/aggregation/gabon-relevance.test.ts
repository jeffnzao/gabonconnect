import assert from "node:assert/strict";
import { computeGabonRelevance } from "./gabon-relevance";

// Institution officielle gabonaise : validee d'office meme sans mot-cle explicite dans le texte.
assert.equal(
  computeGabonRelevance({ title: "Avis aux usagers", excerpt: "Nouveaux horaires d'ouverture au public.", sourceType: "GOVERNMENT", sourceName: "Ministere de l'Interieur" }).isRelevant,
  true,
);
assert.equal(
  computeGabonRelevance({ title: "Communique", excerpt: "Fermeture exceptionnelle des guichets.", sourceType: "DIPLOMATIC", sourceName: "Ambassade du Gabon en France" }).isRelevant,
  true,
);

// Media international avec mention Gabon/diaspora : accepte.
const withMention = computeGabonRelevance({
  title: "La diaspora gabonaise se mobilise a Paris",
  excerpt: "Une rencontre organisee par la communaute gabonaise.",
  sourceType: "MEDIA",
  sourceName: "Le Journal International",
});
assert.equal(withMention.isRelevant, true);
assert.ok(withMention.matchedKeywords.length > 0);

// Media international hors-sujet, sans lien avec le Gabon : rejete.
const offTopic = computeGabonRelevance({
  title: "Elections municipales au Bresil",
  excerpt: "Le second tour se jouera dimanche prochain a Sao Paulo.",
  sourceType: "MEDIA",
  sourceName: "World News Daily",
});
assert.equal(offTopic.isRelevant, false);
assert.equal(offTopic.score, 0);
assert.equal(offTopic.reason, "no_gabon_link");

// Source diaspora sans mention explicite mais avec ville gabonaise : accepte.
const cityMention = computeGabonRelevance({
  title: "Reprise des vols vers Libreville",
  excerpt: "La compagnie annonce de nouvelles liaisons.",
  sourceType: "DIASPORA",
  sourceName: "Diaspora Mag",
});
assert.equal(cityMention.isRelevant, true);

console.log("All Gabon-relevance filter tests passed.");
