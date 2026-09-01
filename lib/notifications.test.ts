// Tests "Targeted Notification Engine & Source Attribution" (Task 060).
// Même approche que les suites précédentes : pas de framework, pas d'accès réseau/DB.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildNotificationMessage,
  buildSourceAttribution,
  deriveArticleTargeting,
  deriveOpportunityTargeting,
  isPreferenceTargeted,
  normalizeLocationHint,
} from "./notifications";

const root = join(__dirname, "..");
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

// 1. L'attribution de source est toujours presente, avec fallback si sourceName/canonicalUrl manquent.
assert.equal(buildSourceAttribution("Gabon Media Time", "https://gabonmediatime.com/a"), "Source : Gabon Media Time (https://gabonmediatime.com/a)");
assert.equal(buildSourceAttribution("Gabon Media Time", null), "Source : Gabon Media Time");
assert.equal(buildSourceAttribution(null, "https://gabonmediatime.com/a"), "Source : https://gabonmediatime.com/a");
assert.equal(buildSourceAttribution(null, null), "Source : GabonConnect");

const message = buildNotificationMessage("Un nouvel accord bilateral a ete signe.", "Gabon Media Time", "https://gabonmediatime.com/a");
assert.ok(message.includes("Source : Gabon Media Time"));
assert.ok(message.includes("Un nouvel accord bilateral a ete signe."));

// 2. Ciblage par statut derive de la categorie/typologie du contenu.
assert.deepEqual(deriveArticleTargeting("CAMPUS"), ["STUDENT"]);
assert.deepEqual(deriveArticleTargeting("OPPORTUNITIES"), ["STUDENT", "PROFESSIONAL"]);
assert.equal(deriveArticleTargeting("GABON"), null);
assert.deepEqual(deriveOpportunityTargeting("INTERNSHIP"), ["STUDENT"]);
assert.deepEqual(deriveOpportunityTargeting("JOB"), ["PROFESSIONAL"]);
assert.equal(deriveOpportunityTargeting("VOLUNTEERING"), null);

// 3. Les lieux generiques (annonces sans localisation exploitable) ne contraignent pas le ciblage.
assert.equal(normalizeLocationHint("See official announcement"), null);
assert.equal(normalizeLocationHint("Remote"), null);
assert.equal(normalizeLocationHint("Paris, France"), "Paris, France");

// 4. Un utilisateur dont un centre d'interet correspond au contenu est toujours notifie.
const campusArticle = {
  title: "Nouvelle bourse pour les etudiants gabonais",
  excerpt: "Le gouvernement gabonais annonce une nouvelle bourse.",
  sourceName: "DGBC",
  canonicalUrl: "https://dgbc.ga/bourses",
  statuses: deriveArticleTargeting("CAMPUS"),
  locationHint: null,
};
assert.equal(
  isPreferenceTargeted(campusArticle, { userId: "u1", memberStatus: "PROFESSIONAL", interests: ["bourse"], cityName: null, countryName: null }),
  true,
  "un interet correspondant doit notifier meme hors statut cible",
);
assert.equal(
  isPreferenceTargeted(campusArticle, { userId: "u2", memberStatus: "STUDENT", interests: [], cityName: null, countryName: null }),
  true,
  "le statut STUDENT correspond a la cible CAMPUS",
);
assert.equal(
  isPreferenceTargeted(campusArticle, { userId: "u3", memberStatus: "PROFESSIONAL", interests: [], cityName: null, countryName: null }),
  false,
  "un professionnel sans interet correspondant ne doit pas etre notifie pour du contenu CAMPUS",
);

// 5. Le ciblage geographique s'appuie sur la ville/pays de l'utilisateur quand le contenu a une localisation exploitable.
const parisEvent = {
  title: "Rencontre de la diaspora",
  excerpt: "Rencontre organisee a Paris.",
  sourceName: "Amicale Gabonaise de Paris",
  canonicalUrl: null,
  statuses: null,
  locationHint: normalizeLocationHint("Paris, France"),
};
assert.equal(isPreferenceTargeted(parisEvent, { userId: "u4", memberStatus: "OTHER", interests: [], cityName: "Paris", countryName: "France" }), true);
assert.equal(isPreferenceTargeted(parisEvent, { userId: "u5", memberStatus: "OTHER", interests: [], cityName: "Montreal", countryName: "Canada" }), false);

// 6. Le workflow de moderation declenche bien le dispatch uniquement pour News/Event/Opportunity publies.
const contentActionsSource = read("lib/actions/content.ts");
assert.match(contentActionsSource, /dispatchContentNotifications\(id, domain as NotifiableContentType\)/);
assert.match(contentActionsSource, /NOTIFIABLE_DOMAINS: ContentDomain\[\] = \["articles", "events", "opportunities"\]/);
assert.match(contentActionsSource, /if \(action === "publish" && NOTIFIABLE_DOMAINS\.includes\(domain\)\)/);

// 7. Le pipeline d'ingestion cron n'a pas ete modifie pour appeler le dispatch (pas de notification a l'ingestion, seulement a la moderation).
const aggregationSource = read("lib/actions/aggregation.ts");
assert.doesNotMatch(aggregationSource, /dispatchContentNotifications/);

console.log("All targeted notification engine tests passed.");
