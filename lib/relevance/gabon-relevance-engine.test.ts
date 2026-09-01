import assert from "node:assert/strict";
import { evaluateGabonRelevance } from "./gabon-relevance-engine";

const base = { contentId: "content-1", domain: "articles" as const, sourceType: "MEDIA" as const, sourceName: "International Journal", title: "", excerpt: "" };

const direct = evaluateGabonRelevance({ ...base, title: "Nouvelle mesure a Libreville pour les ressortissants gabonais" });
assert.equal(direct.score, 70);
assert.equal(direct.level, "L1_GABON_DIRECT");
assert.equal(direct.routing.primary_target, "AUTO_PUBLISH");
assert.deepEqual(direct.score_breakdown.map((entry) => entry.signal), ["gabon_direct", "gabon_nationals"]);

const diaspora = evaluateGabonRelevance({ ...base, title: "Rencontre de la diaspora gabonaise a Paris" });
assert.equal(diaspora.score, 50);
assert.equal(diaspora.level, "L2_DIASPORA_GABONAISE");
assert.equal(diaspora.routing.primary_target, "HUMAN_REVIEW");

const bilateral = evaluateGabonRelevance({ ...base, domain: "scholarships", title: "Bourse de cooperation bilaterale Maroc-Gabon pour etudiants gabonais", excerpt: "Candidature pour un programme d'etudes." });
assert.equal(bilateral.score, 115);
assert.equal(bilateral.level, "L1_GABON_DIRECT");
assert.equal(bilateral.routing.primary_target, "AUTO_PUBLISH");
assert.ok(bilateral.score_breakdown.some((entry) => entry.signal === "eligible_opportunity"));
assert.ok(bilateral.score_breakdown.some((entry) => entry.signal === "bilateral_relation"));

const officialSensitive = evaluateGabonRelevance({ ...base, sourceType: "GOVERNMENT", sourceName: "Ministere de l'Interieur", title: "Communique politique du gouvernement gabonais a Libreville" });
assert.ok(officialSensitive.score >= 70);
assert.equal(officialSensitive.flags.is_sensitive, true);
assert.equal(officialSensitive.flags.requires_human_review, true);
assert.equal(officialSensitive.routing.primary_target, "HUMAN_REVIEW");

const foreignSensitive = evaluateGabonRelevance({ ...base, title: "Election municipale au Bresil", excerpt: "Resultats de Sao Paulo" });
assert.equal(foreignSensitive.level, "L5_HORS_PERIMETRE");
assert.equal(foreignSensitive.routing.primary_target, "QUARANTINE");
assert.equal(foreignSensitive.flags.requires_human_review, false);
assert.equal(foreignSensitive.score, -50);

const spam = evaluateGabonRelevance({ ...base, title: "Gagnez du bitcoin au casino en ligne", excerpt: "Click here" });
assert.equal(spam.routing.primary_target, "QUARANTINE");
assert.equal(spam.score, -150);
assert.ok(spam.score_breakdown.some((entry) => entry.signal === "spam_off_topic"));

console.log("All GRE 2.0 tests passed.");
